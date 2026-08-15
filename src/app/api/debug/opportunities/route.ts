import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// TEMPORARY diagnostic route - remove once the production data-loading
// issue is resolved.

function inspect(value: string) {
  let badCharAt: { index: number; code: number } | null = null;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code > 255) {
      badCharAt = { index: i, code };
      break;
    }
  }
  return { length: value.length, first16: value.slice(0, 16), last16: value.slice(-16), badCharAt };
}

export async function GET() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!isSupabaseConfigured) {
    return NextResponse.json({ isSupabaseConfigured: false, url: inspect(rawUrl), anonKey: inspect(rawAnonKey) });
  }
  const supabase = await createClient();
  const result = await supabase.from("opportunities").select("id, title, status").eq("status", "published").limit(3);
  return NextResponse.json({
    isSupabaseConfigured: true,
    url: inspect(rawUrl),
    anonKey: inspect(rawAnonKey),
    rowCount: result.data?.length ?? null,
    error: result.error,
    status: result.status,
    statusText: result.statusText,
    sample: result.data,
  });
}
