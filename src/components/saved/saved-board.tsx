import Link from "next/link";
import { OrgAvatar } from "@/components/org-avatar";
import { DeadlineBadge } from "@/components/deadline-badge";
import { EmptyState } from "@/components/empty-state";
import { StatusSelect } from "./status-select";
import { SAVED_STATUSES } from "@/lib/types";
import type { SavedOpportunity } from "@/lib/types";
import { Bookmark } from "lucide-react";

export function SavedBoard({ saved }: { saved: SavedOpportunity[] }) {
  if (saved.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="No saved opportunities yet"
        description="Bookmark opportunities from Discover to start building your tracker."
        action={{ label: "Explore Opportunities", href: "/discover" }}
        className="mt-6"
      />
    );
  }

  const columns = SAVED_STATUSES.map((status) => ({
    status,
    items: saved.filter((s) => s.status === status),
  }));

  return (
    <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div key={col.status} className="w-72 shrink-0">
          <div className="flex items-center justify-between px-1 pb-3">
            <h2 className="text-sm font-semibold text-foreground">{col.status}</h2>
            <span className="text-xs text-muted-foreground">{col.items.length}</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {col.items.map((s) => {
              const opp = s.opportunity!;
              return (
                <div key={s.opportunityId} className="rounded-xl border bg-card p-3">
                  <div className="flex items-start gap-2.5">
                    <OrgAvatar name={opp.organization?.name ?? opp.title} size="sm" />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/opportunities/${opp.slug}`}
                        className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary"
                      >
                        {opp.title}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{opp.organization?.name}</p>
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <DeadlineBadge deadline={opp.deadline} rollingDeadline={opp.rollingDeadline} />
                  </div>
                  <div className="mt-2.5">
                    <StatusSelect opportunityId={s.opportunityId} status={s.status} />
                  </div>
                </div>
              );
            })}
            {col.items.length === 0 && (
              <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">Nothing here</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
