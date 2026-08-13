import { NextResponse } from "next/server";
import { processDueReminders } from "@/lib/reminders-worker";

/**
 * Triggered by Vercel Cron (see vercel.json). Authenticated with a shared
 * secret rather than a user session, since there is no user making this
 * request. Refuses to run at all if CRON_SECRET isn't set, so this can't be
 * fired by anyone who finds the URL.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await processDueReminders();
  return NextResponse.json(result);
}
