"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { SAVED_STATUSES, type SavedStatus } from "@/lib/types";
import { syncReminders, cancelReminders, shouldCancelReminders } from "@/lib/reminders";

export interface SaveActionResult {
  error: string | null;
  requiresAuth?: boolean;
}

function revalidateSavedViews() {
  revalidatePath("/saved");
  revalidatePath("/dashboard");
  revalidatePath("/deadlines");
}

/** Fetches just enough of an opportunity to (re)schedule its reminders. */
async function getOpportunityDeadlineInfo(supabase: Awaited<ReturnType<typeof createClient>>, opportunityId: string) {
  const { data } = await supabase
    .from("opportunities")
    .select("deadline, rolling_deadline")
    .eq("id", opportunityId)
    .maybeSingle();
  return data;
}

export async function saveOpportunity(opportunityId: string): Promise<SaveActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: null, requiresAuth: true };

  const supabase = await createClient();
  const { error } = await supabase.from("saved_opportunities").insert({ user_id: user.id, opportunity_id: opportunityId });
  if (error) return { error: error.message };

  const opportunity = await getOpportunityDeadlineInfo(supabase, opportunityId);
  if (opportunity) {
    await syncReminders(supabase, user.id, opportunityId, opportunity.deadline, opportunity.rolling_deadline);
  }

  revalidateSavedViews();
  return { error: null };
}

export async function updateSavedOpportunityStatus(opportunityId: string, status: SavedStatus): Promise<SaveActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in." };
  if (!SAVED_STATUSES.includes(status)) return { error: "Invalid status." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_opportunities")
    .update({ status })
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId);

  if (error) return { error: error.message };

  if (shouldCancelReminders(status)) {
    await cancelReminders(supabase, user.id, opportunityId);
  } else {
    const opportunity = await getOpportunityDeadlineInfo(supabase, opportunityId);
    if (opportunity) {
      await syncReminders(supabase, user.id, opportunityId, opportunity.deadline, opportunity.rolling_deadline);
    }
  }

  revalidateSavedViews();
  return { error: null };
}

export async function removeSavedOpportunity(opportunityId: string): Promise<SaveActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_opportunities")
    .delete()
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId);

  if (error) return { error: error.message };

  await cancelReminders(supabase, user.id, opportunityId);

  revalidateSavedViews();
  return { error: null };
}
