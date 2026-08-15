import { NextResponse } from "next/server";
import { processDueReminders } from "@/lib/reminders-worker";
import { expireOldOpportunities } from "@/lib/expire-opportunities";

/**
 * Triggered by Vercel Cron (see vercel.json). Authenticated with a shared
 * secret rather than a user session, since there is no user making this
 * request. Refuses to run at all if CRON_SECRET isn't set, so this can't be
 * fired by anyone who finds the URL.
 *
 * Also expires past-deadline opportunities here rather than as its own cron
 * route - Vercel's free/hobby plan caps a project at 2 scheduled cron jobs,
 * and that budget is already spent on this route and the discovery scan, so
 * this daily "opportunity housekeeping" pass rides along with reminders.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [reminders, expiry] = await Promise.all([processDueReminders(), expireOldOpportunities()]);
  return NextResponse.json({ reminders, expiry });
}
