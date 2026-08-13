"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitOpportunity, type SubmissionFormState } from "@/lib/actions/submissions";
import { CATEGORIES, GRADES } from "@/lib/types";

const initialState: SubmissionFormState = { status: "idle" };

export function SubmitForm() {
  const [state, formAction, pending] = useActionState(submitOpportunity, initialState);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center rounded-xl border bg-card px-6 py-16 text-center">
        <CheckCircle2 className="size-10 text-success" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">Submission received</h2>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Opportunity name" htmlFor="opportunityName" error={errors.opportunityName}>
          <Input id="opportunityName" name="opportunityName" required />
        </Field>
        <Field label="Organization" htmlFor="organizationName" error={errors.organizationName}>
          <Input id="organizationName" name="organizationName" required />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Website" htmlFor="websiteUrl" error={errors.websiteUrl}>
          <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://" />
        </Field>
        <Field label="Application URL" htmlFor="applicationUrl" error={errors.applicationUrl}>
          <Input id="applicationUrl" name="applicationUrl" type="url" placeholder="https://" />
        </Field>
      </div>

      <Field label="Description" htmlFor="description" error={errors.description}>
        <Textarea id="description" name="description" rows={4} required placeholder="What does this opportunity involve? Who is it for?" />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="category" error={errors.category}>
          <Select name="category" required>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Deadline (if known)" htmlFor="deadline" error={errors.deadline}>
          <Input id="deadline" name="deadline" type="date" />
        </Field>
      </div>

      <Field label="Eligible grades" htmlFor="eligibleGrades" error={errors.eligibleGrades}>
        <div className="flex flex-wrap gap-3">
          {GRADES.map((g) => (
            <label key={g} className="flex items-center gap-1.5 text-sm text-foreground">
              <Checkbox name="eligibleGrades" value={String(g)} />
              Grade {g}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Location" htmlFor="location" error={errors.location}>
          <Input id="location" name="location" placeholder="Remote, Boston MA, etc." />
        </Field>
        <Field label="Cost" htmlFor="cost" error={errors.cost}>
          <Input id="cost" name="cost" placeholder="Free, $500, need-based, etc." />
        </Field>
      </div>

      <Field label="Your contact email" htmlFor="contactEmail" error={errors.contactEmail}>
        <Input id="contactEmail" name="contactEmail" type="email" required placeholder="you@example.com" />
      </Field>

      <Field label="Additional notes" htmlFor="additionalNotes" error={errors.additionalNotes}>
        <Textarea id="additionalNotes" name="additionalNotes" rows={3} placeholder="Anything else our review team should know?" />
      </Field>

      {state.status === "error" && state.message && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Submitting..." : "Submit for Review"}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
