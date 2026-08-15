import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// TEMPORARY diagnostic route - remove once the production data-loading
// issue is resolved. Runs the exact same query as the homepage but returns
// the raw Supabase response (data + error) instead of silently swallowing
// the error, so we can see why production shows 0 opportunities.
export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ isSupabaseConfigured: false });
  }
  const supabase = await createClient();
  const result = await supabase.from("opportunities").select("id, title, status").eq("status", "published").limit(3);
  return NextResponse.json({
    isSupabaseConfigured: true,
    rowCount: result.data?.length ?? null,
    error: result.error,
    status: result.status,
    statusText: result.statusText,
    sample: result.data,
  });
}
