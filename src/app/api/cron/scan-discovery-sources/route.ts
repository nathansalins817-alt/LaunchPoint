import { NextResponse } from "next/server";
import { processDueSources } from "@/lib/discovery/worker";

/**
 * Triggered by Vercel Cron (see vercel.json). Authenticated with a shared
 * secret rather than a user session, since there is no user making this
 * request - mirrors src/app/api/cron/send-deadline-reminders.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await processDueSources();
  return NextResponse.json(result);
}
