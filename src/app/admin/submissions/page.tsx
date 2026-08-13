import type { Metadata } from "next";
import { SubmissionActions } from "@/components/admin/submission-actions";
import { listPendingSubmissions } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Submissions" };

export default async function AdminSubmissionsPage() {
  const submissions = await listPendingSubmissions();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Submissions</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Opportunities suggested by students, counselors, and organizations. Nothing here is public yet.
      </p>

      {submissions.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No pending submissions.
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {submissions.map((s) => (
            <li key={s.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-foreground">{s.opportunity_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {s.organization_name} · {s.category} · Submitted {formatDate(s.submitted_at.slice(0, 10))}
                  </p>
                </div>
                <SubmissionActions id={s.id} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:grid-cols-4">
                <div>
                  <dt className="font-medium text-foreground">Deadline</dt>
                  <dd>{s.deadline ? formatDate(s.deadline) : "Not specified"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Location</dt>
                  <dd>{s.location ?? "Not specified"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Cost</dt>
                  <dd>{s.cost ?? "Not specified"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Contact</dt>
                  <dd className="truncate">{s.contact_email}</dd>
                </div>
              </dl>
              {(s.website_url || s.application_url) && (
                <div className="mt-3 flex gap-3 text-xs">
                  {s.website_url && (
                    <a href={s.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Website
                    </a>
                  )}
                  {s.application_url && (
                    <a href={s.application_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Application
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
