"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, FIELDS, FORMATS, GRADES, VERIFICATION_STATUSES, OPPORTUNITY_STATUSES } from "@/lib/types";
import type { OpportunityFormState } from "@/lib/actions/admin-opportunities";
import type { OpportunityRow, OrganizationRow } from "@/lib/data/admin";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t pt-6 first:border-t-0 first:pt-0">
      <legend className="mb-1 -mt-6 bg-background pr-2 text-sm font-semibold text-foreground">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function OpportunityForm({
  action,
  opportunity,
  organizations,
  existingGrades = [],
  existingFields = [],
}: {
  action: (prevState: OpportunityFormState, formData: FormData) => Promise<OpportunityFormState>;
  opportunity?: OpportunityRow;
  organizations: OrganizationRow[];
  existingGrades?: number[];
  existingFields?: string[];
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-8">
      <Section title="Basics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="title">
            <Input id="title" name="title" defaultValue={opportunity?.title} required />
          </Field>
          <Field label="Slug (auto-generated if blank)" htmlFor="slug">
            <Input id="slug" name="slug" defaultValue={opportunity?.slug} placeholder="nasa-sees-internship" />
          </Field>
        </div>
        <Field label="Organization" htmlFor="organizationId">
          <Select name="organizationId" defaultValue={opportunity?.organization_id}>
            <SelectTrigger id="organizationId" className="w-full">
              <SelectValue placeholder="Choose an organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Short description" htmlFor="shortDescription">
          <Textarea id="shortDescription" name="shortDescription" rows={2} defaultValue={opportunity?.short_description} />
        </Field>
        <Field label="Full description" htmlFor="description">
          <Textarea id="description" name="description" rows={5} defaultValue={opportunity?.description} />
        </Field>
      </Section>

      <Section title="Classification">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Category" htmlFor="category">
            <Select name="category" defaultValue={opportunity?.category ?? "Internship"}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
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
          <Field label="Format" htmlFor="format">
            <Select name="format" defaultValue={opportunity?.format ?? "in-person"}>
              <SelectTrigger id="format" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Fields / interests" htmlFor="fields">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FIELDS.map((f) => (
              <label key={f} className="flex items-center gap-1.5 text-sm text-foreground">
                <Checkbox name="fields" value={f} defaultChecked={existingFields.includes(f)} />
                {f}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Tags (comma-separated)" htmlFor="tags">
          <Input id="tags" name="tags" defaultValue={opportunity?.tags?.join(", ")} placeholder="NASA, Research, Space" />
        </Field>
      </Section>

      <Section title="Location">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="City" htmlFor="city">
            <Input id="city" name="city" defaultValue={opportunity?.city ?? ""} />
          </Field>
          <Field label="State" htmlFor="state">
            <Input id="state" name="state" defaultValue={opportunity?.state ?? ""} placeholder="California" />
          </Field>
          <Field label="Country" htmlFor="country">
            <Input id="country" name="country" defaultValue={opportunity?.country ?? "United States"} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox name="remote" defaultChecked={opportunity?.remote} />
          Remote-eligible
        </label>
      </Section>

      <Section title="Eligibility">
        <Field label="Eligible grades" htmlFor="eligibleGrades">
          <div className="flex flex-wrap gap-3">
            {GRADES.map((g) => (
              <label key={g} className="flex items-center gap-1.5 text-sm text-foreground">
                <Checkbox name="eligibleGrades" value={String(g)} defaultChecked={existingGrades.includes(g)} />
                Grade {g}
              </label>
            ))}
          </div>
        </Field>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox name="gradSeniorsEligible" defaultChecked={opportunity?.grad_seniors_eligible} />
          Open to graduating seniors
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Min age" htmlFor="minAge">
            <Input id="minAge" name="minAge" type="number" defaultValue={opportunity?.min_age ?? ""} />
          </Field>
          <Field label="Max age" htmlFor="maxAge">
            <Input id="maxAge" name="maxAge" type="number" defaultValue={opportunity?.max_age ?? ""} />
          </Field>
        </div>
        <Field label="Citizenship / residency requirement" htmlFor="citizenshipRequirement">
          <Input id="citizenshipRequirement" name="citizenshipRequirement" defaultValue={opportunity?.citizenship_requirement ?? ""} />
        </Field>
        <Field label="Eligibility notes" htmlFor="eligibilityDescription">
          <Textarea id="eligibilityDescription" name="eligibilityDescription" rows={2} defaultValue={opportunity?.eligibility_description} />
        </Field>
      </Section>

      <Section title="Dates">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Applications open" htmlFor="applicationOpenDate">
            <Input id="applicationOpenDate" name="applicationOpenDate" type="date" defaultValue={opportunity?.application_open_date ?? ""} />
          </Field>
          <Field label="Application deadline" htmlFor="deadline">
            <Input id="deadline" name="deadline" type="date" defaultValue={opportunity?.deadline ?? ""} />
          </Field>
          <Field label="Decision date" htmlFor="decisionDate">
            <Input id="decisionDate" name="decisionDate" type="date" defaultValue={opportunity?.decision_date ?? ""} />
          </Field>
          <Field label="Program starts" htmlFor="programStartDate">
            <Input id="programStartDate" name="programStartDate" type="date" defaultValue={opportunity?.program_start_date ?? ""} />
          </Field>
          <Field label="Program ends" htmlFor="programEndDate">
            <Input id="programEndDate" name="programEndDate" type="date" defaultValue={opportunity?.program_end_date ?? ""} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox name="rollingDeadline" defaultChecked={opportunity?.rolling_deadline} />
          Rolling deadline (no fixed date)
        </label>
      </Section>

      <Section title="Cost & activities">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cost (USD, 0 = free)" htmlFor="cost">
            <Input id="cost" name="cost" type="number" step="0.01" defaultValue={opportunity?.cost ?? ""} />
          </Field>
          <Field label="Stipend amount (if paid)" htmlFor="stipendAmount">
            <Input id="stipendAmount" name="stipendAmount" type="number" step="0.01" defaultValue={opportunity?.stipend_amount ?? ""} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox name="paid" defaultChecked={opportunity?.paid} />
            Students are paid
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox name="financialAid" defaultChecked={opportunity?.financial_aid} />
            Financial aid available
          </label>
        </div>
        <Field label="What you'll do (one activity per line)" htmlFor="activities">
          <Textarea id="activities" name="activities" rows={4} defaultValue={opportunity?.activities?.join("\n")} />
        </Field>
      </Section>

      <Section title="Links">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Application URL" htmlFor="applicationUrl">
            <Input id="applicationUrl" name="applicationUrl" type="url" defaultValue={opportunity?.application_url} />
          </Field>
          <Field label="Website URL" htmlFor="websiteUrl">
            <Input id="websiteUrl" name="websiteUrl" type="url" defaultValue={opportunity?.website_url} />
          </Field>
        </div>
        <Field label="FAQ URL" htmlFor="faqUrl">
          <Input id="faqUrl" name="faqUrl" type="url" defaultValue={opportunity?.faq_url ?? ""} />
        </Field>
      </Section>

      <Section title="Publishing & data quality">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Status" htmlFor="status">
            <Select name="status" defaultValue={opportunity?.status ?? "pending"}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPPORTUNITY_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Verification status" htmlFor="verificationStatus">
            <Select name="verificationStatus" defaultValue={opportunity?.verification_status ?? "needs_review"}>
              <SelectTrigger id="verificationStatus" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERIFICATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Last verified" htmlFor="lastVerifiedAt">
            <Input id="lastVerifiedAt" name="lastVerifiedAt" type="date" defaultValue={opportunity?.last_verified_at?.slice(0, 10) ?? ""} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox name="featured" defaultChecked={opportunity?.featured} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox name="isSampleData" defaultChecked={opportunity?.is_sample_data} />
            Sample / demo data (unverified)
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox name="markVerifiedNow" />
            Mark verified as of today
          </label>
        </div>
      </Section>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end gap-3 border-t pt-6">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : opportunity ? "Save Changes" : "Create Opportunity"}
        </Button>
      </div>
    </form>
  );
}
