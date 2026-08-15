import "server-only";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";

/**
 * Flips published opportunities whose deadline has passed to status
 * "expired" - removed from the public active list (see lib/data/index.ts's
 * status filtering) while the row itself is kept for the admin. Opportunities
 * with no deadline (rolling_deadline ones) are untouched since they have no
 * date to compare against. Uses the service-role client since this runs from
 * the cron route with no admin session.
 */
export async function expireOldOpportunities(): Promise<{ expired: number }> {
  if (!isServiceRoleConfigured) return { expired: 0 };

  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("opportunities")
    .update({ status: "expired" })
    .eq("status", "published")
    .not("deadline", "is", null)
    .lt("deadline", today)
    .select("id");

  return { expired: data?.length ?? 0 };
}
