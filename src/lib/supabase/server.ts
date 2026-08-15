import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers. Create a new instance per request - never share one across
 * requests (see @supabase/ssr docs).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component that can't set cookies - the
          // proxy is responsible for refreshing the session in that case.
        }
      },
    },
    // Route-level `dynamic = "force-dynamic"` (root layout) doesn't reliably
    // reach fetches made inside third-party SDKs - Vercel was still caching
    // these specific outbound requests, so force no-store directly on every
    // call this client makes.
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
