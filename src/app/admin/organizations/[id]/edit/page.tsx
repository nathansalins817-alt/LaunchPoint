import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrganizationForm } from "@/components/admin/organization-form";
import { getAdminOrganization } from "@/lib/data/admin";
import { updateOrganization } from "@/lib/actions/admin-organizations";

export const metadata: Metadata = { title: "Edit Organization" };

export default async function EditOrganizationPage({ params }: PageProps<"/admin/organizations/[id]/edit">) {
  const { id } = await params;
  const organization = await getAdminOrganization(id);
  if (!organization) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Organization</h1>
      <div className="mt-6">
        <OrganizationForm action={updateOrganization.bind(null, id)} organization={organization} />
      </div>
    </div>
  );
}
