import type { Metadata } from "next";
import { OrganizationForm } from "@/components/admin/organization-form";
import { createOrganization } from "@/lib/actions/admin-organizations";

export const metadata: Metadata = { title: "New Organization" };

export default function NewOrganizationPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">New Organization</h1>
      <div className="mt-6">
        <OrganizationForm action={createOrganization} />
      </div>
    </div>
  );
}
