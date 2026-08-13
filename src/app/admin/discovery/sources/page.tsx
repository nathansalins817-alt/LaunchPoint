import type { Metadata } from "next";
import { AddSourceForm } from "@/components/admin/add-source-form";
import { SourceActions } from "@/components/admin/source-actions";
import { listDiscoverySources } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Discovery Sources" };

export default async function DiscoverySourcesPage() {
  const sources = await listDiscoverySources();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Discovery Sources</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Approved public sources LaunchPoint is allowed to check for new opportunities — official university,
        government, nonprofit, and company pages only.
      </p>

      <div className="mt-6 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Add a source</h2>
        <div className="mt-4">
          <AddSourceForm />
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-foreground">{sources.length} source{sources.length === 1 ? "" : "s"}</h2>
      {sources.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No sources yet. Add one above to start monitoring it.
        </div>
      ) : (
        <ul className="mt-3 divide-y rounded-xl border bg-card">
          {sources.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{s.organization_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.source_url} · {s.source_type.replace("_", " ")} · Checked{" "}
                  {s.last_checked_at ? formatDate(s.last_checked_at.slice(0, 10)) : "never"}
                </p>
              </div>
              <SourceActions id={s.id} active={s.active} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
