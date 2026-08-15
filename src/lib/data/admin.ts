import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Admin reads/writes the live Supabase tables directly using raw snake_case
 * Row/Insert types, for CRUD forms. lib/data/index.ts serves the same
 * tables to the public site (falling back to the bootstrapped catalog in
 * seed-data.ts when Supabase isn't configured) mapped onto the camelCase
 * domain types in lib/types.ts - the two layers exist for different callers,
 * not because one is stale.
 */

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"];
type OpportunityInsert = Database["public"]["Tables"]["opportunities"]["Insert"];
type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
type OrganizationInsert = Database["public"]["Tables"]["organizations"]["Insert"];

export async function getAdminStats() {
  const supabase = await createClient();
  const [opportunities, active, submissions, users, deadlineSoon] = await Promise.all([
    supabase.from("opportunities").select("id", { count: "exact", head: true }),
    supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("opportunity_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .not("deadline", "is", null)
      .lte("deadline", new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10))
      .gte("deadline", new Date().toISOString().slice(0, 10)),
  ]);

  return {
    totalOpportunities: opportunities.count ?? 0,
    activeOpportunities: active.count ?? 0,
    pendingSubmissions: submissions.count ?? 0,
    registeredUsers: users.count ?? 0,
    upcomingDeadlines: deadlineSoon.count ?? 0,
  };
}

export async function getReminderStats() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [due, scheduled, sentToday] = await Promise.all([
    supabase.from("deadline_reminders").select("id", { count: "exact", head: true }).is("sent_at", null).lte("remind_at", nowIso),
    supabase.from("deadline_reminders").select("id", { count: "exact", head: true }).is("sent_at", null).gt("remind_at", nowIso),
    supabase.from("deadline_reminders").select("id", { count: "exact", head: true }).gte("sent_at", startOfToday.toISOString()),
  ]);

  return {
    due: due.count ?? 0,
    scheduled: scheduled.count ?? 0,
    sentToday: sentToday.count ?? 0,
  };
}

export async function listAdminOpportunities(): Promise<OpportunityRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("opportunities").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAdminOpportunity(id: string): Promise<OpportunityRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("opportunities").select("*").eq("id", id).single();
  return data ?? null;
}

export async function getOpportunityGrades(id: string): Promise<number[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("opportunity_grades").select("grade").eq("opportunity_id", id);
  return (data ?? []).map((r) => r.grade);
}

export async function getOpportunityFieldNames(id: string): Promise<string[]> {
  const supabase = await createClient();
  const { data: links } = await supabase.from("opportunity_interests").select("interest_id").eq("opportunity_id", id);
  const ids = (links ?? []).map((r) => r.interest_id);
  if (ids.length === 0) return [];
  const { data: rows } = await supabase.from("interests").select("name").in("id", ids);
  return (rows ?? []).map((r) => r.name);
}

export async function listAdminOrganizations(): Promise<OrganizationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("organizations").select("*").order("name", { ascending: true });
  return data ?? [];
}

export async function getAdminOrganization(id: string): Promise<OrganizationRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("organizations").select("*").eq("id", id).single();
  return data ?? null;
}

export async function listPendingSubmissions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("opportunity_submissions")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });
  return data ?? [];
}

export async function listOpportunityReports() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("opportunity_reports")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (!reports || reports.length === 0) return [];

  const opportunityIds = [...new Set(reports.map((r) => r.opportunity_id))];
  const { data: opportunities } = await supabase.from("opportunities").select("id, title, slug").in("id", opportunityIds);
  const byId = new Map((opportunities ?? []).map((o) => [o.id, o]));

  return reports.map((r) => ({ ...r, opportunity: byId.get(r.opportunity_id) ?? null }));
}

export async function getDiscoveryStats() {
  const supabase = await createClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [sources, discoveredThisMonth, needsReview, duplicates, changes, brokenLinks] = await Promise.all([
    supabase.from("discovery_sources").select("id", { count: "exact", head: true }).eq("active", true),
    supabase
      .from("discovered_opportunities")
      .select("id", { count: "exact", head: true })
      .gte("discovered_at", startOfMonth.toISOString()),
    supabase.from("discovered_opportunities").select("id", { count: "exact", head: true }).in("review_status", ["new", "needs_review"]),
    supabase.from("discovered_opportunities").select("id", { count: "exact", head: true }).eq("review_status", "possible_duplicate"),
    supabase.from("opportunity_changes").select("id", { count: "exact", head: true }).eq("review_status", "pending"),
    supabase.from("discovery_runs").select("id", { count: "exact", head: true }).eq("status", "failed"),
  ]);

  return {
    sourcesMonitored: sources.count ?? 0,
    discoveredThisMonth: discoveredThisMonth.count ?? 0,
    needsReview: needsReview.count ?? 0,
    possibleDuplicates: duplicates.count ?? 0,
    pendingChanges: changes.count ?? 0,
    brokenLinks: brokenLinks.count ?? 0,
    pendingInbox: (needsReview.count ?? 0) + (duplicates.count ?? 0),
  };
}

export async function listDiscoverySources() {
  const supabase = await createClient();
  const { data } = await supabase.from("discovery_sources").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function listDiscoveredByStatus(status: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("discovered_opportunities")
    .select("*")
    .eq("review_status", status)
    .order("discovered_at", { ascending: false });
  if (!data || data.length === 0) return [];

  const sourceIds = [...new Set(data.map((r) => r.source_id))];
  const { data: sources } = await supabase.from("discovery_sources").select("id, organization_name, source_url").in("id", sourceIds);
  const byId = new Map((sources ?? []).map((s) => [s.id, s]));

  return data.map((r) => ({ ...r, source: byId.get(r.source_id) ?? null }));
}

export async function getDiscoveryPreferences() {
  const supabase = await createClient();
  const { data } = await supabase.from("discovery_preferences").select("*").limit(1).maybeSingle();
  return data;
}

export async function listDiscoverySearches(limit = 15) {
  const supabase = await createClient();
  const { data: searches } = await supabase
    .from("discovery_searches")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (!searches || searches.length === 0) return [];

  const searchIds = searches.map((s) => s.id);
  const { data: items } = await supabase.from("discovered_opportunities").select("search_id, review_status").in("search_id", searchIds);

  const countsBySearch = new Map<string, { approved: number; denied: number; needsReview: number }>();
  for (const item of items ?? []) {
    if (!item.search_id) continue;
    const counts = countsBySearch.get(item.search_id) ?? { approved: 0, denied: 0, needsReview: 0 };
    if (item.review_status === "approved") counts.approved += 1;
    else if (item.review_status === "rejected") counts.denied += 1;
    else if (item.review_status === "needs_review" || item.review_status === "possible_duplicate") counts.needsReview += 1;
    countsBySearch.set(item.search_id, counts);
  }

  return searches.map((s) => ({ ...s, counts: countsBySearch.get(s.id) ?? { approved: 0, denied: 0, needsReview: 0 } }));
}

export async function listPendingChanges() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("opportunity_changes")
    .select("*")
    .eq("review_status", "pending")
    .order("detected_at", { ascending: false });
  return data ?? [];
}

export async function listRecentRuns(limit = 10) {
  const supabase = await createClient();
  const { data: runs } = await supabase
    .from("discovery_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (!runs || runs.length === 0) return [];

  const sourceIds = [...new Set(runs.map((r) => r.source_id))];
  const { data: sources } = await supabase.from("discovery_sources").select("id, organization_name").in("id", sourceIds);
  const byId = new Map((sources ?? []).map((s) => [s.id, s.organization_name]));

  return runs.map((r) => ({ ...r, sourceName: byId.get(r.source_id) ?? "Unknown source" }));
}

export async function listFailedRuns() {
  const supabase = await createClient();
  const { data: runs } = await supabase
    .from("discovery_runs")
    .select("*")
    .eq("status", "failed")
    .order("started_at", { ascending: false });
  if (!runs || runs.length === 0) return [];

  const sourceIds = [...new Set(runs.map((r) => r.source_id))];
  const { data: sources } = await supabase.from("discovery_sources").select("id, organization_name").in("id", sourceIds);
  const byId = new Map((sources ?? []).map((s) => [s.id, s.organization_name]));

  return runs.map((r) => ({ ...r, sourceName: byId.get(r.source_id) ?? "Unknown source" }));
}

export type { OpportunityRow, OpportunityInsert, OrganizationRow, OrganizationInsert };
