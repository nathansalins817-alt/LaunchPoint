import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpportunityRowActions } from "@/components/admin/opportunity-row-actions";
import { listAdminOpportunities, listAdminOrganizations } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Manage Opportunities" };

const STATUS_VARIANT: Record<string, string> = {
  published: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  expired: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/10 text-destructive",
  draft: "bg-muted text-muted-foreground",
};

export default async function AdminOpportunitiesPage() {
  const [opportunities, organizations] = await Promise.all([listAdminOpportunities(), listAdminOrganizations()]);
  const orgById = new Map(organizations.map((o) => [o.id, o.name]));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Opportunities</h1>
          <p className="mt-1 text-sm text-muted-foreground">{opportunities.length} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/opportunities/new">
            <Plus className="size-4" />
            New Opportunity
          </Link>
        </Button>
      </div>

      {opportunities.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No opportunities in the database yet. Run the SQL migration + seed, or create one manually.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="max-w-64 truncate px-4 py-3 font-medium text-foreground">{o.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{orgById.get(o.organization_id) ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_VARIANT[o.status] ?? ""}>{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.deadline ? formatDate(o.deadline) : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.featured ? "Yes" : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <OpportunityRowActions id={o.id} featured={o.featured} status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
