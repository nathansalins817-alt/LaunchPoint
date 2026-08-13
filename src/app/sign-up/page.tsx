import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { SupabaseNotice } from "@/components/auth/supabase-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Create Account" };

export default function SignUpPage() {
  return (
    <AuthShell title="Create your account" description="Free for students. Takes less than a minute.">
      {!isSupabaseConfigured && <SupabaseNotice />}
      <SignUpForm />
    </AuthShell>
  );
}
