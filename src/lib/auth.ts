import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Profile } from "@/lib/types";

export const getCurrentUser = cache(async () => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!data) return null;

  const { data: interestLinks } = await supabase.from("user_interests").select("interest_id").eq("user_id", user.id);
  const interestIds = (interestLinks ?? []).map((r) => r.interest_id);
  let interests: string[] = [];
  if (interestIds.length > 0) {
    const { data: interestRows } = await supabase.from("interests").select("name").in("id", interestIds);
    interests = (interestRows ?? []).map((r) => r.name);
  }

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    grade: (data.grade as Profile["grade"]) ?? null,
    location: data.location,
    interests,
    opportunityInterests: (data.opportunity_interests ?? []) as Profile["opportunityInterests"],
    locationPreference: data.location_preference as Profile["locationPreference"],
    costPreference: data.cost_preference as Profile["costPreference"],
    onboardingCompleted: data.onboarding_completed,
    isAdmin: data.is_admin,
    createdAt: data.created_at,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");
  if (!profile.isAdmin) redirect("/dashboard");
  return profile;
}
