import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { htmlToText, extractOpportunitiesFromPage } from "./extract";
import { computeDiscoveryMatch, type DiscoveryPreferences } from "./score";
import { isGeminiConfigured } from "./env";

/**
 * Shared core of the discovery-scanning pipeline: fetch a source's page,
 * extract candidates, score them against the admin's preferences, land them
 * in the review queue. Invoked by the admin's manual "Find New Opportunities"
 * / per-source "Run Scan" actions (session-based client, gated by
 * requireAdmin()) and the Vercel Cron route (service-role client, no user
 * session) - one place this logic lives, matching the deadline-reminders
 * pipeline's shape.
 */

interface DiscoverySourceRow {
  id: string;
  organization_name: string;
  source_url: string;
  check_frequency: string;
  last_checked_at: string | null;
}

const FREQUENCY_MS: Record<string, number> = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

export function isSourceDue(source: Pick<DiscoverySourceRow, "last_checked_at" | "check_frequency">, now = new Date()): boolean {
  if (!source.last_checked_at) return true;
  const intervalMs = FREQUENCY_MS[source.check_frequency] ?? FREQUENCY_MS.weekly;
  return now.getTime() - new Date(source.last_checked_at).getTime() >= intervalMs;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any>;

async function loadPreferences(supabase: AnySupabase): Promise<DiscoveryPreferences> {
  const { data } = await supabase.from("discovery_preferences").select("*").limit(1).maybeSingle();
  return {
    interests: data?.interests ?? [],
    opportunityTypes: data?.opportunity_types ?? [],
    minGrade: data?.min_grade ?? null,
    maxGrade: data?.max_grade ?? null,
    formatPreference: data?.format_preference ?? "any",
  };
}

export interface ScanOutcome {
  status: "completed" | "failed";
  opportunitiesFound: number;
  highMatchCount: number;
  errors: string | null;
}

const HIGH_MATCH_THRESHOLD = 85;

async function scanSource(
  supabase: AnySupabase,
  source: DiscoverySourceRow,
  context: { searchId: string; preferences: DiscoveryPreferences }
): Promise<ScanOutcome> {
  let opportunitiesFound = 0;
  let highMatchCount = 0;
  let errors: string | null = null;
  let status: "completed" | "failed" = "completed";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(source.source_url, { signal: controller.signal, method: "GET" });
    clearTimeout(timeout);

    if (!res.ok) {
      status = "failed";
      errors = `Source responded with HTTP ${res.status}`;
    } else if (!isGeminiConfigured) {
      errors = "GEMINI_API_KEY is not set - source is reachable but nothing was extracted.";
    } else {
      const html = await res.text();
      const pageText = htmlToText(html);
      const candidates = await extractOpportunitiesFromPage({
        sourceUrl: source.source_url,
        organizationName: source.organization_name,
        pageText,
      });

      const { data: alreadySeen } = await supabase
        .from("discovered_opportunities")
        .select("raw_title")
        .eq("source_id", source.id);
      const seenTitles = new Set((alreadySeen ?? []).map((r: { raw_title: string }) => r.raw_title.toLowerCase()));

      const { data: existingOpportunities } = await supabase.from("opportunities").select("id, title, application_url");
      const opportunityByTitle = new Map(
        (existingOpportunities ?? []).map((o: { id: string; title: string }) => [o.title.toLowerCase(), o.id])
      );
      const opportunityByUrl = new Map(
        (existingOpportunities ?? [])
          .filter((o: { application_url: string | null }) => o.application_url)
          .map((o: { id: string; application_url: string }) => [o.application_url.toLowerCase(), o.id])
      );

      for (const candidate of candidates) {
        const key = candidate.title.toLowerCase();
        if (seenTitles.has(key)) continue; // already surfaced from a prior scan of this source
        seenTitles.add(key);

        const duplicateOfId =
          opportunityByTitle.get(key) ??
          (candidate.applicationUrl ? opportunityByUrl.get(candidate.applicationUrl.toLowerCase()) : undefined) ??
          null;
        const match = computeDiscoveryMatch(context.preferences, candidate);

        const { error: insertError } = await supabase.from("discovered_opportunities").insert({
          source_id: source.id,
          search_id: context.searchId,
          raw_title: candidate.title,
          raw_content: pageText.slice(0, 2000),
          extracted_data: candidate,
          confidence_score: candidate.confidence,
          match_score: match.score,
          duplicate_of_id: duplicateOfId,
          review_status: duplicateOfId ? "possible_duplicate" : "new",
        });
        if (!insertError) {
          opportunitiesFound += 1;
          if (match.score >= HIGH_MATCH_THRESHOLD) highMatchCount += 1;
        }
      }
    }
  } catch (err) {
    status = "failed";
    errors = err instanceof Error ? err.message : "Scan failed";
  }

  const now = new Date().toISOString();
  await supabase.from("discovery_runs").insert({
    source_id: source.id,
    status,
    completed_at: now,
    opportunities_found: opportunitiesFound,
    errors,
  });
  await supabase.from("discovery_sources").update({ last_checked_at: now }).eq("id", source.id);

  return { status, opportunitiesFound, highMatchCount, errors };
}

export interface ProcessDiscoveryResult {
  searchId: string | null;
  sourcesScanned: number;
  sourcesSkipped: number;
  opportunitiesFound: number;
  highMatchCount: number;
  failures: number;
  errors: string[];
}

/** Runs one "search": scans every given source (or, if `force` is false,
 * only the ones whose check_frequency window has elapsed), scores each
 * candidate against the admin's preferences, and logs the whole run as one
 * discovery_searches row for the Search History panel. */
async function runDiscoveryBatch(
  supabase: AnySupabase,
  sources: DiscoverySourceRow[],
  triggeredBy: "manual" | "cron",
  force: boolean
): Promise<ProcessDiscoveryResult> {
  const result: ProcessDiscoveryResult = {
    searchId: null,
    sourcesScanned: 0,
    sourcesSkipped: 0,
    opportunitiesFound: 0,
    highMatchCount: 0,
    failures: 0,
    errors: [],
  };

  const due = force ? sources : sources.filter((s) => isSourceDue(s));
  result.sourcesSkipped = sources.length - due.length;

  const { data: search } = await supabase
    .from("discovery_searches")
    .insert({ triggered_by: triggeredBy })
    .select("id")
    .single();
  if (!search) {
    result.errors.push("Failed to start a search record.");
    return result;
  }
  result.searchId = search.id;

  const preferences = await loadPreferences(supabase);

  for (const source of due) {
    const outcome = await scanSource(supabase, source, { searchId: search.id, preferences });
    result.sourcesScanned += 1;
    result.opportunitiesFound += outcome.opportunitiesFound;
    result.highMatchCount += outcome.highMatchCount;
    if (outcome.status === "failed") {
      result.failures += 1;
      if (outcome.errors) result.errors.push(`${source.organization_name}: ${outcome.errors}`);
    }
  }

  await supabase
    .from("discovery_searches")
    .update({ completed_at: new Date().toISOString(), sources_scanned: result.sourcesScanned, opportunities_found: result.opportunitiesFound })
    .eq("id", search.id);

  return result;
}

/** Scans one source immediately, regardless of whether it's "due" - used by
 * the per-source "Run Scan" button. */
export async function scanOneSourceNow(supabase: AnySupabase, source: DiscoverySourceRow): Promise<ProcessDiscoveryResult> {
  return runDiscoveryBatch(supabase, [source], "manual", true);
}

/** Scans every active source right now regardless of schedule - used by the
 * prominent "Find New Opportunities" admin dashboard button. */
export async function findNewOpportunitiesNow(supabase: AnySupabase): Promise<ProcessDiscoveryResult> {
  const { data: sources } = await supabase.from("discovery_sources").select("*").eq("active", true);
  return runDiscoveryBatch(supabase, sources ?? [], "manual", true);
}

/** Scans only sources whose check_frequency window has elapsed, using the
 * caller's (session-based, admin) client - the secondary "Scan Due Sources
 * Now" control. */
export async function scanDueSourcesWithClient(supabase: AnySupabase): Promise<ProcessDiscoveryResult> {
  const { data: sources } = await supabase.from("discovery_sources").select("*").eq("active", true);
  return runDiscoveryBatch(supabase, sources ?? [], "manual", false);
}

/** Same as scanDueSourcesWithClient but for the daily Vercel Cron trigger,
 * which has no user session - must use the service-role client, the one
 * place in this pipeline that bypasses RLS. */
export async function processDueSources(): Promise<ProcessDiscoveryResult> {
  if (!isServiceRoleConfigured) {
    return { searchId: null, sourcesScanned: 0, sourcesSkipped: 0, opportunitiesFound: 0, highMatchCount: 0, failures: 0, errors: ["SUPABASE_SERVICE_ROLE_KEY is not set."] };
  }
  const supabase = createAdminClient();
  const { data: sources, error } = await supabase.from("discovery_sources").select("*").eq("active", true);
  if (error) {
    return { searchId: null, sourcesScanned: 0, sourcesSkipped: 0, opportunitiesFound: 0, highMatchCount: 0, failures: 0, errors: [`Failed to load sources: ${error.message}`] };
  }
  return runDiscoveryBatch(supabase, sources ?? [], "cron", false);
}
