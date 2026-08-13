import "server-only";
import { Resend } from "resend";
import { RESEND_API_KEY } from "./env";

let client: Resend | null = null;

/** Lazily constructs the Resend client. Callers must check
 * `isResendConfigured` first - this throws if RESEND_API_KEY is empty. */
export function getResendClient(): Resend {
  if (!client) client = new Resend(RESEND_API_KEY);
  return client;
}
