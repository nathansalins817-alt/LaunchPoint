import "server-only";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getResendClient } from "@/lib/email/client";
import { isResendConfigured, EMAIL_FROM } from "@/lib/email/env";
import { renderDeadlineReminderEmail } from "@/lib/email/templates/deadline-reminder";
import { formatDate } from "@/lib/format";
import type { ReminderThreshold } from "@/lib/reminders";

/**
 * Shared core of the deadline-reminder pipeline: find due reminders, send
 * one email each via Resend, mark them sent. Invoked by both the Vercel
 * Cron route (src/app/api/cron/send-deadline-reminders) and the admin
 * "Send Due Reminders Now" button, so there is exactly one place this logic
 * lives. Requires the service-role client, since it runs with no logged-in
 * user and must read across every account.
 */

export interface ProcessRemindersResult {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
}

const BATCH_LIMIT = 200;

export async function processDueReminders(): Promise<ProcessRemindersResult> {
  const result: ProcessRemindersResult = { processed: 0, sent: 0, failed: 0, skipped: 0, errors: [] };

  if (!isServiceRoleConfigured) {
    result.errors.push("SUPABASE_SERVICE_ROLE_KEY is not set.");
    return result;
  }
  if (!isResendConfigured) {
    result.errors.push("RESEND_API_KEY is not set.");
    return result;
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data: dueReminders, error: reminderError } = await supabase
    .from("deadline_reminders")
    .select("*")
    .is("sent_at", null)
    .lte("remind_at", nowIso)
    .order("remind_at", { ascending: true })
    .limit(BATCH_LIMIT);

  if (reminderError) {
    result.errors.push(`Failed to load due reminders: ${reminderError.message}`);
    return result;
  }
  if (!dueReminders || dueReminders.length === 0) {
    return result;
  }
  result.processed = dueReminders.length;

  const opportunityIds = [...new Set(dueReminders.map((r) => r.opportunity_id))];
  const userIds = [...new Set(dueReminders.map((r) => r.user_id))];

  const [{ data: opportunities }, { data: profiles }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id, slug, title, deadline, application_url, organization_id")
      .in("id", opportunityIds),
    supabase.from("profiles").select("id, first_name").in("id", userIds),
  ]);

  const orgIds = [...new Set((opportunities ?? []).map((o) => o.organization_id))];
  const { data: organizations } =
    orgIds.length > 0 ? await supabase.from("organizations").select("id, name").in("id", orgIds) : { data: [] };

  const opportunityById = new Map((opportunities ?? []).map((o) => [o.id, o]));
  const organizationNameById = new Map((organizations ?? []).map((o) => [o.id, o.name]));
  const firstNameById = new Map((profiles ?? []).map((p) => [p.id, p.first_name]));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const resend = getResendClient();

  // Sent sequentially (not Promise.all) to stay well under Resend's rate
  // limits - a batch of up to 200 reminders is not worth parallelizing.
  for (const reminder of dueReminders) {
    const opportunity = opportunityById.get(reminder.opportunity_id);
    if (!opportunity || !opportunity.deadline) {
      // Opportunity was deleted or lost its deadline since this reminder
      // was scheduled - nothing meaningful left to remind about.
      await supabase.from("deadline_reminders").delete().eq("id", reminder.id);
      result.skipped++;
      continue;
    }

    const { data: userResult, error: userError } = await supabase.auth.admin.getUserById(reminder.user_id);
    const email = userResult?.user?.email;
    if (userError || !email) {
      result.failed++;
      result.errors.push(`No email on file for user ${reminder.user_id}: ${userError?.message ?? "unknown error"}`);
      continue;
    }

    const { subject, html } = renderDeadlineReminderEmail({
      firstName: firstNameById.get(reminder.user_id) ?? "",
      opportunityTitle: opportunity.title,
      organizationName: organizationNameById.get(opportunity.organization_id) ?? "this organization",
      deadlineLabel: formatDate(opportunity.deadline) ?? opportunity.deadline,
      daysBefore: reminder.days_before as ReminderThreshold,
      opportunityUrl: `${siteUrl}/opportunities/${opportunity.slug}`,
      applicationUrl: opportunity.application_url,
      savedUrl: `${siteUrl}/saved`,
    });

    const { error: sendError } = await resend.emails.send({ from: EMAIL_FROM, to: email, subject, html });

    if (sendError) {
      result.failed++;
      result.errors.push(`Failed to send to ${email}: ${sendError.message}`);
      continue;
    }

    await supabase.from("deadline_reminders").update({ sent_at: new Date().toISOString() }).eq("id", reminder.id);
    result.sent++;
  }

  return result;
}
