"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { syncReminders, cancelReminders, shouldCancelReminders } from "@/lib/reminders";
import type { Database } from "@/lib/supabase/database.types";

type OpportunityInsert = Database["public"]["Tables"]["opportunities"]["Insert"];

export interface OpportunityFormState {
  error?: string;
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

function num(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  return v === null ? null : Number(v);
}

function parseOpportunityFields(formData: FormData): Omit<OpportunityInsert, "id"> {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = str(formData, "slug");

  return {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    organization_id: String(formData.get("organizationId") ?? ""),
    short_description: str(formData, "shortDescription") ?? "",
    description: str(formData, "description") ?? "",
    category: String(formData.get("category") ?? "Internship"),
    format: String(formData.get("format") ?? "in-person"),
    city: str(formData, "city"),
    state: str(formData, "state"),
    country: str(formData, "country") ?? "United States",
    remote: formData.get("remote") === "on",
    grad_seniors_eligible: formData.get("gradSeniorsEligible") === "on",
    min_age: num(formData, "minAge"),
    max_age: num(formData, "maxAge"),
    citizenship_requirement: str(formData, "citizenshipRequirement"),
    eligibility_description: str(formData, "eligibilityDescription") ?? "",
    deadline: str(formData, "deadline"),
    rolling_deadline: formData.get("rollingDeadline") === "on",
    application_open_date: str(formData, "applicationOpenDate"),
    decision_date: str(formData, "decisionDate"),
    program_start_date: str(formData, "programStartDate"),
    program_end_date: str(formData, "programEndDate"),
    cost: num(formData, "cost"),
    paid: formData.get("paid") === "on",
    stipend_amount: num(formData, "stipendAmount"),
    financial_aid: formData.get("financialAid") === "on",
    activities: (str(formData, "activities") ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
    application_url: str(formData, "applicationUrl") ?? "",
    website_url: str(formData, "websiteUrl") ?? "",
    faq_url: str(formData, "faqUrl"),
    tags: (str(formData, "tags") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    featured: formData.get("featured") === "on",
    status: String(formData.get("status") ?? "pending"),
    is_sample_data: formData.get("isSampleData") === "on",
    verification_status: String(formData.get("verificationStatus") ?? "needs_review"),
    last_verified_at: formData.get("markVerifiedNow") === "on" ? new Date().toISOString() : str(formData, "lastVerifiedAt"),
  };
}

async function syncGradesAndInterests(opportunityId: string, formData: FormData) {
  const supabase = await createClient();
  const grades = formData.getAll("eligibleGrades").map(Number);
  const fields = formData.getAll("fields").map(String);

  await supabase.from("opportunity_grades").delete().eq("opportunity_id", opportunityId);
  if (grades.length > 0) {
    await supabase.from("opportunity_grades").insert(grades.map((grade) => ({ opportunity_id: opportunityId, grade })));
  }

  await supabase.from("opportunity_interests").delete().eq("opportunity_id", opportunityId);
  if (fields.length > 0) {
    const { data: rows } = await supabase.from("interests").select("id, name").in("name", fields);
    const ids = (rows ?? []).map((r) => r.id);
    if (ids.length > 0) {
      await supabase
        .from("opportunity_interests")
        .insert(ids.map((interest_id) => ({ opportunity_id: opportunityId, interest_id })));
    }
  }
}

/** Re-syncs every saver's reminders after an admin edit, since an admin
 * changing a deadline should be reflected in reminders that were computed
 * from the old date - otherwise a student could be reminded on a schedule
 * that no longer matches the real deadline. */
async function resyncRemindersForOpportunity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  opportunityId: string,
  deadline: string | null,
  rollingDeadline: boolean
) {
  const { data: savers } = await supabase
    .from("saved_opportunities")
    .select("user_id, status")
    .eq("opportunity_id", opportunityId);

  for (const saver of savers ?? []) {
    if (shouldCancelReminders(saver.status)) {
      await cancelReminders(supabase, saver.user_id, opportunityId);
    } else {
      await syncReminders(supabase, saver.user_id, opportunityId, deadline, rollingDeadline);
    }
  }
}

export async function createOpportunity(_prev: OpportunityFormState, formData: FormData): Promise<OpportunityFormState> {
  await requireAdmin();
  const fields = parseOpportunityFields(formData);
  if (!fields.organization_id) return { error: "Choose an organization." };

  const supabase = await createClient();
  const { data, error } = await supabase.from("opportunities").insert(fields).select("id").single();
  if (error || !data) return { error: error?.message ?? "Couldn't create the opportunity." };

  await syncGradesAndInterests(data.id, formData);
  revalidatePath("/admin/opportunities");
  redirect("/admin/opportunities");
}

export async function updateOpportunity(id: string, _prev: OpportunityFormState, formData: FormData): Promise<OpportunityFormState> {
  await requireAdmin();
  const fields = parseOpportunityFields(formData);
  if (!fields.organization_id) return { error: "Choose an organization." };

  const supabase = await createClient();
  const { error } = await supabase.from("opportunities").update(fields).eq("id", id);
  if (error) return { error: error.message };

  await syncGradesAndInterests(id, formData);
  await resyncRemindersForOpportunity(supabase, id, fields.deadline ?? null, fields.rolling_deadline ?? false);
  revalidatePath("/admin/opportunities");
  revalidatePath(`/opportunities/${fields.slug}`);
  redirect("/admin/opportunities");
}

export async function deleteOpportunity(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("opportunities").delete().eq("id", id);
  revalidatePath("/admin/opportunities");
}

export async function toggleFeatured(id: string, featured: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("opportunities").update({ featured }).eq("id", id);
  revalidatePath("/admin/opportunities");
}

export async function setOpportunityStatus(id: string, status: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("opportunities").update({ status }).eq("id", id);

  if (status === "expired" || status === "rejected") {
    const { data: savers } = await supabase.from("saved_opportunities").select("user_id").eq("opportunity_id", id);
    for (const saver of savers ?? []) {
      await cancelReminders(supabase, saver.user_id, id);
    }
  }

  revalidatePath("/admin/opportunities");
}

export async function markVerified(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("opportunities")
    .update({ verification_status: "verified", last_verified_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/opportunities");
}
