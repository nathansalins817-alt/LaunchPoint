import type { Metadata } from "next";
import { OpportunityForm } from "@/components/admin/opportunity-form";
import { listAdminOrganizations } from "@/lib/data/admin";
import { createOpportunity } from "@/lib/actions/admin-opportunities";

export const metadata: Metadata = { title: "New Opportunity" };

export default async function NewOpportunityPage() {
  const organizations = await listAdminOrganizations();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">New Opportunity</h1>
      <p className="mt-1 text-sm text-muted-foreground">This is created as a draft in your live Supabase catalog.</p>
      <div className="mt-6">
        <OpportunityForm action={createOpportunity} organizations={organizations} />
      </div>
    </div>
  );
}
