import type { Metadata } from "next";
import { SubmitForm } from "@/components/submit/submit-form";

export const metadata: Metadata = {
  title: "Submit an Opportunity",
  description: "Suggest an internship, scholarship, or program for LaunchPoint's review team to verify and add.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Submit an Opportunity</h1>
      <p className="mt-2 text-muted-foreground">
        Know about a great internship, scholarship, or program? Tell us about it. Our team reviews every
        submission before it appears on LaunchPoint.
      </p>

      <div className="mt-8">
        <SubmitForm />
      </div>
    </div>
  );
}
