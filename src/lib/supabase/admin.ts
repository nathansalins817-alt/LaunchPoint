import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { SUPABASE_URL } from "./env";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isServiceRoleConfigured = Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);

/**
 * Privileged client that bypasses Row Level Security entirely. There is no
 * logged-in user or cookie session behind it, so it must NEVER be used to
 * serve a request on a user's behalf - only for trusted background work
 * with no user context, like the deadline-reminder cron worker, which needs
 * to read reminders and look up sender emails across every account.
 */
export function createAdminClient() {
  if (!isServiceRoleConfigured) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set - cannot create an admin Supabase client.");
  }
  return createSupabaseClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
