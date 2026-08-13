"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { CATEGORIES } from "@/lib/types";

const schema = z.object({
  opportunityName: z.string().min(2, "Please enter the opportunity name."),
  organizationName: z.string().min(2, "Please enter the organization name."),
  websiteUrl: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
  applicationUrl: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
  description: z.string().min(20, "Please write at least a short description (20+ characters)."),
  category: z.string().refine((v) => (CATEGORIES as readonly string[]).includes(v), {
    message: "Please choose a category.",
  }),
  deadline: z.string().optional(),
  eligibleGrades: z.array(z.string()).default([]),
  location: z.string().optional(),
  cost: z.string().optional(),
  contactEmail: z.string().email("Enter a valid email address."),
  additionalNotes: z.string().optional(),
});

export interface SubmissionFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitOpportunity(_prev: SubmissionFormState, formData: FormData): Promise<SubmissionFormState> {
  const parsed = schema.safeParse({
    opportunityName: formData.get("opportunityName"),
    organizationName: formData.get("organizationName"),
    websiteUrl: formData.get("websiteUrl") || "",
    applicationUrl: formData.get("applicationUrl") || "",
    description: formData.get("description"),
    category: formData.get("category"),
    deadline: formData.get("deadline") || undefined,
    eligibleGrades: formData.getAll("eligibleGrades").map(String),
    location: formData.get("location") || undefined,
    cost: formData.get("cost") || undefined,
    contactEmail: formData.get("contactEmail"),
    additionalNotes: formData.get("additionalNotes") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please fix the errors below.", fieldErrors };
  }

  if (!isSupabaseConfigured) {
    return { status: "error", message: "Submissions aren't available in this preview yet." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("opportunity_submissions").insert({
    opportunity_name: parsed.data.opportunityName,
    organization_name: parsed.data.organizationName,
    website_url: parsed.data.websiteUrl || null,
    application_url: parsed.data.applicationUrl || null,
    description: parsed.data.description,
    category: parsed.data.category,
    deadline: parsed.data.deadline || null,
    eligible_grades: parsed.data.eligibleGrades.map(Number),
    location: parsed.data.location || null,
    cost: parsed.data.cost || null,
    contact_email: parsed.data.contactEmail,
    additional_notes: parsed.data.additionalNotes || null,
    status: "pending",
  });

  if (error) {
    return { status: "error", message: "Something went wrong submitting your opportunity. Please try again." };
  }

  return { status: "success", message: "Thanks! Our team will review your submission before it goes live." };
}
