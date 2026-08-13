"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
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

/**
 * Checks that an approved source is still reachable and logs the result.
 * This does NOT extract or create opportunities - there is no content
 * parser wired up yet (see lib/types.ts ExtractedOpportunityData for the
 * schema a future extraction worker should fill in). Fabricating discovered
 * listings from an HTTP 200 would violate the "never invent data" rule, so
 * a scan only ever produces a reachability record for admin review.
 */
export async function runDiscoveryScan(sourceId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: source } = await supabase.from("discovery_sources").select("*").eq("id", sourceId).single();
  if (!source) return;

  const { data: run } = await supabase
    .from("discovery_runs")
    .insert({ source_id: sourceId, status: "running" })
    .select("id")
    .single();

  let status: "completed" | "failed" = "completed";
  let errors: string | null = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(source.source_url, { signal: controller.signal, method: "GET" });
    clearTimeout(timeout);
    if (!res.ok) {
      status = "failed";
      errors = `Source responded with HTTP ${res.status}`;
    }
  } catch (err) {
    status = "failed";
    errors = err instanceof Error ? err.message : "Fetch failed";
  }

  const now = new Date().toISOString();
  if (run) {
    await supabase
      .from("discovery_runs")
      .update({ status, completed_at: now, opportunities_found: 0, errors })
      .eq("id", run.id);
  }
  await supabase.from("discovery_sources").update({ last_checked_at: now }).eq("id", sourceId);

  revalidatePath("/admin/discovery");
  revalidatePath("/admin/discovery/sources");
}

export async function reviewDiscoveredOpportunity(
  id: string,
  action: "reject" | "duplicate" | "save_for_later"
) {
  await requireAdmin();
  const supabase = await createClient();
  const reviewStatus = action === "reject" ? "rejected" : action === "duplicate" ? "possible_duplicate" : "saved_for_later";
  await supabase.from("discovered_opportunities").update({ review_status: reviewStatus }).eq("id", id);
  revalidatePath("/admin/discovery");
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
