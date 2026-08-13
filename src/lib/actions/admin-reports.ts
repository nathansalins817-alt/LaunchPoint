"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function resolveReport(id: string, status: "resolved" | "dismissed") {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("opportunity_reports").update({ status }).eq("id", id);
  revalidatePath("/admin/reports");
}
