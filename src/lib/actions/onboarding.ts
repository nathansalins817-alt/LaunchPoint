"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { ONBOARDING_INTERESTS } from "@/lib/constants";

export interface OnboardingFormState {
  error?: string;
}

export async function completeOnboarding(_prev: OnboardingFormState, formData: FormData): Promise<OnboardingFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in first." };

  const grade = formData.get("grade");
  const interestLabels = formData.getAll("interests").map(String);
  const opportunityInterests = formData.getAll("opportunityInterests").map(String);
  const locationPreference = String(formData.get("locationPreference") || "") || null;
  const costPreference = String(formData.get("costPreference") || "") || null;

  const fields = Array.from(
    new Set(
      ONBOARDING_INTERESTS.filter((g) => interestLabels.includes(g.label)).flatMap((g) => g.fields)
    )
  );

  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      grade: grade ? Number(grade) : null,
      opportunity_interests: opportunityInterests,
      location_preference: locationPreference,
      cost_preference: costPreference,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (profileError) return { error: "Couldn't save your profile. Please try again." };

  if (fields.length > 0) {
    const { data: interestRows } = await supabase.from("interests").select("id, name").in("name", fields);
    const ids = (interestRows ?? []).map((r) => r.id);

    await supabase.from("user_interests").delete().eq("user_id", user.id);
    if (ids.length > 0) {
      await supabase.from("user_interests").insert(ids.map((interest_id) => ({ user_id: user.id, interest_id })));
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function skipOnboarding() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const supabase = await createClient();
  await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
