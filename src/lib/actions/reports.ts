"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { REPORT_REASONS } from "@/lib/types";

const schema = z.object({
  opportunityId: z.string().min(1),
  reason: z.enum(REPORT_REASONS),
  details: z.string().max(2000).optional(),
  reporterEmail: z.string().email().optional().or(z.literal("")),
});

export interface ReportFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function reportOpportunity(_prev: ReportFormState, formData: FormData): Promise<ReportFormState> {
  const parsed = schema.safeParse({
    opportunityId: formData.get("opportunityId"),
    reason: formData.get("reason"),
    details: formData.get("details") || undefined,
    reporterEmail: formData.get("reporterEmail") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Please choose a reason before submitting." };
  }

  if (!isSupabaseConfigured) {
    return { status: "error", message: "Reporting isn't available in this preview yet." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("opportunity_reports").insert({
    opportunity_id: parsed.data.opportunityId,
    reason: parsed.data.reason,
    details: parsed.data.details ?? null,
    reporter_email: parsed.data.reporterEmail || null,
  });

  if (error) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  return { status: "success", message: "Thanks — our team will review this report." };
}
