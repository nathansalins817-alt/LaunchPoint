"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

export interface OrgFormState {
  error?: string;
}

function parseOrgFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  return {
    name,
    slug: slugify(slugInput || name),
    description: String(formData.get("description") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    organization_type: String(formData.get("organizationType") ?? "Company"),
    logo_url: String(formData.get("logoUrl") ?? "").trim() || null,
  };
}

export async function createOrganization(_prev: OrgFormState, formData: FormData): Promise<OrgFormState> {
  await requireAdmin();
  const fields = parseOrgFields(formData);
  if (!fields.name || !fields.website) return { error: "Name and website are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("organizations").insert(fields);
  if (error) return { error: error.message };

  revalidatePath("/admin/organizations");
  redirect("/admin/organizations");
}

export async function updateOrganization(id: string, _prev: OrgFormState, formData: FormData): Promise<OrgFormState> {
  await requireAdmin();
  const fields = parseOrgFields(formData);
  if (!fields.name || !fields.website) return { error: "Name and website are required." };

  const supabase = await createClient();
  const { error } = await supabase.from("organizations").update(fields).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/organizations");
  redirect("/admin/organizations");
}

export async function deleteOrganization(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("organizations").delete().eq("id", id);
  revalidatePath("/admin/organizations");
}
