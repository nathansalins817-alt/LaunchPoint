import "server-only";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { opportunities } from "@/lib/data/seed-data";
import type { SavedOpportunity, SavedStatus } from "@/lib/types";

/** Opportunity IDs the current visitor has saved, for cheap card-level lookups. */
export async function getSavedOpportunityIds(): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) return new Set();

  const supabase = await createClient();
  const { data } = await supabase.from("saved_opportunities").select("opportunity_id").eq("user_id", user.id);
  return new Set((data ?? []).map((r) => r.opportunity_id));
}

const opportunityById = new Map(opportunities.map((o) => [o.id, o]));

export async function getSavedOpportunities(): Promise<SavedOpportunity[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_opportunities")
    .select("*")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  const results: SavedOpportunity[] = [];
  for (const row of data ?? []) {
    const opportunity = opportunityById.get(row.opportunity_id);
    if (!opportunity) continue;
    results.push({
      userId: row.user_id,
      opportunityId: row.opportunity_id,
      opportunity,
      status: row.status as SavedStatus,
      savedAt: row.saved_at,
    });
  }
  return results;
}
