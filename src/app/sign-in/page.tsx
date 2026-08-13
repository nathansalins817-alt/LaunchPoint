import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SupabaseNotice } from "@/components/auth/supabase-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign In" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <AuthShell title="Welcome back" description="Sign in to save opportunities and track deadlines.">
      {!isSupabaseConfigured && <SupabaseNotice />}
      <SignInForm next={next} />
    </AuthShell>
  );
}
