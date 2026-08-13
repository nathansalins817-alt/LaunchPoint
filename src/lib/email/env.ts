export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";

/** Falls back to Resend's shared test address so sends don't hard-fail
 * before a sending domain has been verified - swap via EMAIL_FROM once
 * you've verified a domain in the Resend dashboard. */
export const EMAIL_FROM = process.env.EMAIL_FROM || "LaunchPoint <onboarding@resend.dev>";

export const isResendConfigured = Boolean(RESEND_API_KEY);
