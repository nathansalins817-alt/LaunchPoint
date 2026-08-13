import Link from "next/link";
import type { Metadata } from "next";
import { ReportActions } from "@/components/admin/report-actions";
import { listOpportunityReports } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  const reports = await listOpportunityReports();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reports</h1>
      <p className="mt-1 text-sm text-muted-foreground">Issues flagged by students on live listings.</p>

      {reports.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No open reports.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  {r.opportunity ? (
                    <Link href={`/opportunities/${r.opportunity.slug}`} className="font-medium text-foreground hover:text-primary">
                      {r.opportunity.title}
                    </Link>
                  ) : (
                    <p className="font-medium text-foreground">Unknown opportunity</p>
                  )}
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {r.reason} · Reported {formatDate(r.created_at.slice(0, 10))}
                    {r.reporter_email ? ` · ${r.reporter_email}` : ""}
                  </p>
                  {r.details && <p className="mt-1.5 text-sm text-muted-foreground">{r.details}</p>}
                </div>
                <ReportActions id={r.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
