"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { processDueReminders, type ProcessRemindersResult } from "@/lib/reminders-worker";

export async function sendDueRemindersNow(): Promise<ProcessRemindersResult> {
  await requireAdmin();
  const result = await processDueReminders();
  revalidatePath("/admin");
  return result;
}
