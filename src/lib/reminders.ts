import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/database.types";

/**
 * Deadline reminder scheduling (section 22: 30/14/7/1-day nudges). Pure
 * computation lives here so it's easy to unit-test and reuse from any
 * server action; the one function that touches the database (syncReminders)
 * takes an already-constructed Supabase client rather than creating its
 * own, so callers control whether it runs under the user's session or the
 * service-role admin client.
 */

export const REMINDER_THRESHOLDS = [30, 14, 7, 1] as const;
export type ReminderThreshold = (typeof REMINDER_THRESHOLDS)[number];

// Reminders become "due" at this UTC hour, chosen to land in the morning
// across US time zones; the cron worker just checks remind_at <= now().
const REMINDER_HOUR_UTC = 13;

export interface ReminderRow {
  user_id: string;
  opportunity_id: string;
  days_before: ReminderThreshold;
  remind_at: string;
}

/** Computes the reminder rows still worth scheduling for a deadline -
 * thresholds that have already passed relative to `now` are skipped rather
 * than silently backdated. Returns [] for rolling or missing deadlines. */
export function computeReminderRows(
  userId: string,
  opportunityId: string,
  deadline: string | null,
  rollingDeadline: boolean,
  now: Date = new Date()
): ReminderRow[] {
  if (!deadline || rollingDeadline) return [];

  const deadlineDate = new Date(`${deadline}T00:00:00Z`);
  if (Number.isNaN(deadlineDate.getTime())) return [];

  const rows: ReminderRow[] = [];
  for (const days of REMINDER_THRESHOLDS) {
    const remindAt = new Date(deadlineDate);
    remindAt.setUTCDate(remindAt.getUTCDate() - days);
    remindAt.setUTCHours(REMINDER_HOUR_UTC, 0, 0, 0);
    if (remindAt.getTime() <= now.getTime()) continue;
    rows.push({
      user_id: userId,
      opportunity_id: opportunityId,
      days_before: days,
      remind_at: remindAt.toISOString(),
    });
  }
  return rows;
}

/** Statuses where a student no longer needs deadline nudges. */
export function shouldCancelReminders(status: string): boolean {
  return status === "Applied" || status === "Accepted" || status === "Not Pursuing";
}

/** Replaces a user's not-yet-sent reminders for one opportunity with a
 * freshly computed set. Already-sent reminders are left alone as history. */
export async function syncReminders(
  supabase: SupabaseClient<Database>,
  userId: string,
  opportunityId: string,
  deadline: string | null,
  rollingDeadline: boolean
): Promise<void> {
  await supabase
    .from("deadline_reminders")
    .delete()
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId)
    .is("sent_at", null);

  const rows = computeReminderRows(userId, opportunityId, deadline, rollingDeadline);
  if (rows.length > 0) {
    await supabase.from("deadline_reminders").insert(rows);
  }
}

/** Cancels (deletes) a user's not-yet-sent reminders for one opportunity,
 * without scheduling new ones - used when a save is removed or its status
 * moves to Applied/Accepted/Not Pursuing. */
export async function cancelReminders(
  supabase: SupabaseClient<Database>,
  userId: string,
  opportunityId: string
): Promise<void> {
  await supabase
    .from("deadline_reminders")
    .delete()
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId)
    .is("sent_at", null);
}
