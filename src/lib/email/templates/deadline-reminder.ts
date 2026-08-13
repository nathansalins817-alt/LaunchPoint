function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface DeadlineReminderEmailParams {
  firstName: string;
  opportunityTitle: string;
  organizationName: string;
  deadlineLabel: string;
  daysBefore: 30 | 14 | 7 | 1;
  opportunityUrl: string;
  applicationUrl: string;
  savedUrl: string;
}

/** Renders a deadline reminder as a plain inline-styled HTML string rather
 * than a React Email component - email clients need inline CSS and there's
 * exactly one template, so pulling in @react-email/components for this
 * wasn't worth it. */
export function renderDeadlineReminderEmail(params: DeadlineReminderEmailParams): { subject: string; html: string } {
  const title = escapeHtml(params.opportunityTitle);
  const org = escapeHtml(params.organizationName);
  const firstName = escapeHtml(params.firstName || "there");
  const deadlineLabel = escapeHtml(params.deadlineLabel);

  const urgencyText = params.daysBefore === 1 ? "closes tomorrow" : `closes in ${params.daysBefore} days`;
  const subject = params.daysBefore === 1 ? `Closes tomorrow — ${params.opportunityTitle}` : `${params.daysBefore} days left to apply — ${params.opportunityTitle}`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background-color:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5ea;">
      <tr>
        <td style="padding:28px 32px 0 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:28px;height:28px;border-radius:8px;background-color:#4f46e5;text-align:center;vertical-align:middle;font-size:15px;">
                <span style="color:#ffffff;font-weight:700;">L</span>
              </td>
              <td style="padding-left:8px;font-size:15px;font-weight:600;color:#18181b;">LaunchPoint</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px 0 32px;">
          <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:.02em;color:#dc2626;text-transform:uppercase;">Deadline reminder</p>
          <h1 style="margin:8px 0 0 0;font-size:21px;line-height:1.35;color:#18181b;">Hi ${firstName}, ${title} ${urgencyText}.</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px 0 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f6;border-radius:12px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0;font-size:14px;color:#71717a;">Organization</p>
                <p style="margin:2px 0 12px 0;font-size:15px;color:#18181b;font-weight:500;">${org}</p>
                <p style="margin:0;font-size:14px;color:#71717a;">Application deadline</p>
                <p style="margin:2px 0 0 0;font-size:15px;color:#18181b;font-weight:500;">${deadlineLabel}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px 0 32px;">
          <a href="${params.applicationUrl}" style="display:block;text-align:center;background-color:#4f46e5;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 20px;border-radius:10px;">Apply Now</a>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 32px 0 32px;text-align:center;">
          <a href="${params.opportunityUrl}" style="font-size:13px;color:#4f46e5;text-decoration:none;">View full details on LaunchPoint</a>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px 28px 32px;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#a1a1aa;">
            You're getting this because you saved this opportunity on LaunchPoint. Update its status or remove it anytime from
            <a href="${params.savedUrl}" style="color:#a1a1aa;">your saved opportunities</a> to stop these reminders.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html };
}
