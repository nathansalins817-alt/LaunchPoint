import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrgAvatar } from "@/components/org-avatar";
import { listAdminOrganizations } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Manage Organizations" };

export default async function AdminOrganizationsPage() {
  const organizations = await listAdminOrganizations();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Organizations</h1>
          <p className="mt-1 text-sm text-muted-foreground">{organizations.length} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/organizations/new">
            <Plus className="size-4" />
            New Organization
          </Link>
        </Button>
      </div>

      {organizations.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No organizations yet.
        </div>
      ) : (
        <ul className="mt-6 divide-y rounded-xl border bg-card">
          {organizations.map((org) => (
            <li key={org.id} className="flex items-center gap-3 p-4">
              <OrgAvatar name={org.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{org.name}</p>
                <p className="truncate text-xs text-muted-foreground">{org.organization_type} · {org.website}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/organizations/${org.id}/edit`}>Edit</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
