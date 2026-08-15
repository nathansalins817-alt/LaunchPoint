"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import {
  scanOneSourceNow,
  findNewOpportunitiesNow as runFindNewOpportunitiesNow,
  scanDueSourcesWithClient,
  type ProcessDiscoveryResult,
} from "@/lib/discovery/worker";
import type { Database } from "@/lib/supabase/database.types";

export interface SourceFormState {
  error?: string;
}

export async function createSource(_prev: SourceFormState, formData: FormData): Promise<SourceFormState> {
  await requireAdmin();
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const sourceType = String(formData.get("sourceType") ?? "nonprofit");
  const checkFrequency = String(formData.get("checkFrequency") ?? "weekly");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!organizationName || !sourceUrl) return { error: "Organization name and source URL are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("discovery_sources").insert({
    organization_name: organizationName,
    source_url: sourceUrl,
    source_type: sourceType,
    check_frequency: checkFrequency,
    notes,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/discovery/sources");
  return {};
}

export async function toggleSourceActive(id: string, active: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("discovery_sources").update({ active }).eq("id", id);
  revalidatePath("/admin/discovery/sources");
}

export async function deleteSource(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("discovery_sources").delete().eq("id", id);
  revalidatePath("/admin/discovery/sources");
}

/** Scans one source immediately (the per-source "Run Scan" button), regardless
 * of its check_frequency schedule. See lib/discovery/worker.ts for the shared
 * fetch + extract + score + insert pipeline this and every other scan action
 * delegate to. */
export async function runDiscoveryScan(sourceId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: source } = await supabase.from("discovery_sources").select("*").eq("id", sourceId).single();
  if (!source) return;

  await scanOneSourceNow(supabase, source);
  revalidatePath("/admin/discovery");
  revalidatePath("/admin/discovery/sources");
}

/** The prominent "Find New Opportunities" button - scans every active source
 * right now, regardless of schedule, so an admin always gets fresh results
 * on demand. */
export async function findNewOpportunitiesNow(): Promise<ProcessDiscoveryResult> {
  await requireAdmin();
  const supabase = await createClient();
  const result = await runFindNewOpportunitiesNow(supabase);
  revalidatePath("/admin");
  revalidatePath("/admin/discovery");
  return result;
}

/** Secondary control: only scans sources whose check_frequency window has
 * actually elapsed, same rule the daily cron uses. */
export async function scanDueSourcesNow(): Promise<ProcessDiscoveryResult> {
  await requireAdmin();
  const supabase = await createClient();
  const result = await scanDueSourcesWithClient(supabase);
  revalidatePath("/admin/discovery");
  revalidatePath("/admin/discovery/sources");
  return result;
}

interface ExtractedFields {
  title: string;
  category: string | null;
  shortDescription: string | null;
  deadline: string | null;
  format: string | null;
  location: string | null;
  state: string | null;
  cost: number | null;
  eligibilityNotes: string | null;
  applicationUrl: string | null;
  grades: number[];
}

async function resolveOrganizationId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationName: string,
  fallbackWebsite: string
): Promise<string | null> {
  const { data: existingOrg } = await supabase.from("organizations").select("id").ilike("name", organizationName).maybeSingle();
  if (existingOrg) return existingOrg.id;

  const { data: newOrg, error } = await supabase
    .from("organizations")
    .insert({
      name: organizationName,
      slug: slugify(organizationName),
      website: fallbackWebsite,
      organization_type: "Nonprofit",
      description: "",
    })
    .select("id")
    .single();
  if (error || !newOrg) return null;
  return newOrg.id;
}

/**
 * Approve = the one click the admin has to make. Publishes the candidate
 * straight to the live catalog (status "published") using exactly what the
 * AI extracted - no separate draft/edit step, per how this pipeline is
 * meant to be used. Still records who approved it and when
 * (reviewed_at/reviewed_by), and this is still the *only* path a discovered
 * candidate can reach the public site - it never happens without this
 * explicit call.
 */
export async function approveDiscoveredOpportunity(id: string) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { data: item } = await supabase.from("discovered_opportunities").select("*").eq("id", id).single();
  if (!item) return;
  const { data: source } = await supabase.from("discovery_sources").select("*").eq("id", item.source_id).single();

  const extracted = item.extracted_data as unknown as ExtractedFields;
  const organizationName = source?.organization_name ?? "Unknown Organization";
  const organizationId = await resolveOrganizationId(supabase, organizationName, source?.source_url ?? "");
  if (!organizationId) return;

  const { data: newOpportunity, error: oppError } = await supabase
    .from("opportunities")
    .insert({
      title: extracted.title,
      slug: slugify(extracted.title),
      organization_id: organizationId,
      description: extracted.shortDescription ?? "",
      short_description: extracted.shortDescription ?? "",
      eligibility_description: extracted.eligibilityNotes ?? "",
      category: extracted.category ?? "Internship",
      format: extracted.format ?? "in-person",
      state: extracted.state,
      city: extracted.location,
      application_url: extracted.applicationUrl ?? source?.source_url ?? "",
      website_url: extracted.applicationUrl ?? source?.source_url ?? "",
      deadline: extracted.deadline,
      cost: extracted.cost,
      status: "published",
      is_sample_data: false,
      verification_status: "needs_review",
    })
    .select("id")
    .single();

  if (oppError || !newOpportunity) return;

  if (extracted.grades?.length > 0) {
    await supabase
      .from("opportunity_grades")
      .insert(extracted.grades.filter((g) => g >= 8 && g <= 12).map((grade) => ({ opportunity_id: newOpportunity.id, grade })));
  }

  await supabase
    .from("discovered_opportunities")
    .update({ review_status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: admin.id })
    .eq("id", id);

  revalidatePath("/admin/discovery");
  revalidatePath("/admin/opportunities");
  revalidatePath("/discover");
}

/** Deny = mark it internally so it never gets suggested again, but nothing
 * public ever existed for it in the first place. */
export async function denyDiscoveredOpportunity(id: string) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("discovered_opportunities")
    .update({ review_status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: admin.id })
    .eq("id", id);
  revalidatePath("/admin/discovery");
}

export async function saveDiscoveredOpportunityForLater(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("discovered_opportunities").update({ review_status: "saved_for_later" }).eq("id", id);
  revalidatePath("/admin/discovery");
}

export async function addNoteToDiscoveredOpportunity(id: string, note: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("discovered_opportunities").update({ admin_note: note.trim() || null }).eq("id", id);
  revalidatePath("/admin/discovery");
}

export async function markDiscoveredOpportunityNeedsVerification(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("discovered_opportunities").update({ review_status: "needs_review", confidence_score: 0 }).eq("id", id);
  revalidatePath("/admin/discovery");
}

/** Bulk variants of approve/deny for the inbox's multi-select toolbar. Each
 * item still goes through the exact same approve/deny logic individually -
 * "bulk" only means looping, never a shortcut that skips a check. */
export async function approveDiscoveredOpportunities(ids: string[]) {
  for (const id of ids) await approveDiscoveredOpportunity(id);
}

export async function denyDiscoveredOpportunities(ids: string[]) {
  for (const id of ids) await denyDiscoveredOpportunity(id);
}

/** "Approve all verified" - verified here means the extractor was directly
 * confident (>=70%) this was a real, explicitly-stated listing, not a vague
 * or ambiguous mention. Never includes possible-duplicate rows. */
export async function approveAllVerifiedDiscoveredOpportunities() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("discovered_opportunities")
    .select("id")
    .in("review_status", ["new", "needs_review"])
    .gte("confidence_score", 0.7);
  await approveDiscoveredOpportunities((data ?? []).map((r) => r.id));
}

export async function updateDiscoveryPreferences(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const interests = formData.getAll("interests").map(String);
  const opportunityTypes = formData.getAll("opportunityTypes").map(String);
  const minGrade = formData.get("minGrade") ? Number(formData.get("minGrade")) : null;
  const maxGrade = formData.get("maxGrade") ? Number(formData.get("maxGrade")) : null;
  const formatPreference = String(formData.get("formatPreference") ?? "any");
  const geographicNotes = String(formData.get("geographicNotes") ?? "").trim() || null;

  const { data: existing } = await supabase.from("discovery_preferences").select("id").limit(1).maybeSingle();
  if (existing) {
    await supabase
      .from("discovery_preferences")
      .update({
        interests,
        opportunity_types: opportunityTypes,
        min_grade: minGrade,
        max_grade: maxGrade,
        format_preference: formatPreference,
        geographic_notes: geographicNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("discovery_preferences").insert({
      interests,
      opportunity_types: opportunityTypes,
      min_grade: minGrade,
      max_grade: maxGrade,
      format_preference: formatPreference,
      geographic_notes: geographicNotes,
    });
  }

  revalidatePath("/admin/discovery/settings");
}

export async function reviewOpportunityChange(id: string, action: "accept" | "ignore") {
  await requireAdmin();
  const supabase = await createClient();

  if (action === "accept") {
    const { data: change } = await supabase.from("opportunity_changes").select("*").eq("id", id).single();
    if (change) {
      const patch: Record<string, string | null> = { [change.field_name]: change.new_value };
      await supabase
        .from("opportunities")
        .update(patch as Database["public"]["Tables"]["opportunities"]["Update"])
        .eq("id", change.opportunity_id);
    }
  }

  await supabase
    .from("opportunity_changes")
    .update({ review_status: action === "accept" ? "accepted" : "ignored" })
    .eq("id", id);

  revalidatePath("/admin/discovery");
}
