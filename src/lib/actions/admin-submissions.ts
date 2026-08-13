"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

export async function rejectSubmission(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("opportunity_submissions").update({ status: "rejected" }).eq("id", id);
  revalidatePath("/admin/submissions");
}

/** Converts a public submission into a draft-quality opportunity (status
 * "pending") and hands the admin to the full editor to finish it - a
 * submission never skips review to reach students directly. */
export async function approveSubmission(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: submission } = await supabase.from("opportunity_submissions").select("*").eq("id", id).single();
  if (!submission) return;

  let organizationId: string;
  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("id")
    .ilike("name", submission.organization_name)
    .maybeSingle();

  if (existingOrg) {
    organizationId = existingOrg.id;
  } else {
    const { data: newOrg, error } = await supabase
      .from("organizations")
      .insert({
        name: submission.organization_name,
        slug: slugify(submission.organization_name),
        website: submission.website_url ?? "",
        organization_type: "Nonprofit",
        description: "",
      })
      .select("id")
      .single();
    if (error || !newOrg) return;
    organizationId = newOrg.id;
  }

  const { data: newOpportunity, error: oppError } = await supabase
    .from("opportunities")
    .insert({
      title: submission.opportunity_name,
      slug: slugify(submission.opportunity_name),
      organization_id: organizationId,
      description: submission.description,
      short_description: submission.description.slice(0, 160),
      category: submission.category,
      format: "in-person",
      state: submission.location,
      application_url: submission.application_url ?? "",
      website_url: submission.website_url ?? submission.application_url ?? "",
      deadline: submission.deadline,
      status: "pending",
      is_sample_data: false,
      verification_status: "needs_review",
    })
    .select("id")
    .single();

  if (oppError || !newOpportunity) return;

  if (submission.eligible_grades.length > 0) {
    await supabase
      .from("opportunity_grades")
      .insert(submission.eligible_grades.map((grade) => ({ opportunity_id: newOpportunity.id, grade })));
  }

  await supabase.from("opportunity_submissions").update({ status: "approved" }).eq("id", id);

  revalidatePath("/admin/submissions");
  revalidatePath("/admin/opportunities");
  redirect(`/admin/opportunities/${newOpportunity.id}/edit`);
}
