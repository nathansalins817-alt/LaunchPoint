import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./env";

const PROTECTED_PATHS = ["/dashboard", "/saved", "/deadlines", "/onboarding", "/admin"];

/**
 * Optimistic session check that runs on every request (see Next.js proxy
 * guide). Refreshes the Supabase auth cookie and redirects unauthenticated
 * visitors away from account-only routes. Real authorization still happens
 * again in each page/Server Action - this is only the fast, first pass.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const isProtected = PROTECTED_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!isSupabaseConfigured) {
    if (isProtected) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/sign-in";
      redirectUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
