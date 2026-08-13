import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireUser, getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Set Up Your Profile" };

export default async function OnboardingPage() {
  await requireUser();
  const profile = await getCurrentProfile();
  if (profile?.onboardingCompleted) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <OnboardingWizard firstName={profile?.firstName ?? ""} />
    </div>
  );
}
