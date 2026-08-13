import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpportunityForm } from "@/components/admin/opportunity-form";
import {
  getAdminOpportunity,
  listAdminOrganizations,
  getOpportunityGrades,
  getOpportunityFieldNames,
} from "@/lib/data/admin";
import { updateOpportunity } from "@/lib/actions/admin-opportunities";

export const metadata: Metadata = { title: "Edit Opportunity" };

export default async function EditOpportunityPage({ params }: PageProps<"/admin/opportunities/[id]/edit">) {
  const { id } = await params;
  const [opportunity, organizations, grades, fields] = await Promise.all([
    getAdminOpportunity(id),
    listAdminOrganizations(),
    getOpportunityGrades(id),
    getOpportunityFieldNames(id),
  ]);

  if (!opportunity) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Opportunity</h1>
      <p className="mt-1 truncate text-sm text-muted-foreground">{opportunity.title}</p>
      <div className="mt-6">
        <OpportunityForm
          action={updateOpportunity.bind(null, id)}
          opportunity={opportunity}
          organizations={organizations}
          existingGrades={grades}
          existingFields={fields}
        />
      </div>
    </div>
  );
}
