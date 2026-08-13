import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { OrgAvatar } from "@/components/org-avatar";
import { DeadlineBadge } from "@/components/deadline-badge";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/format";
import { getDeadlineInfo } from "@/lib/deadline";
import type { SavedOpportunity } from "@/lib/types";

export function DeadlinesList({ saved }: { saved: SavedOpportunity[] }) {
  const withDeadlines = saved
    .filter((s) => s.opportunity && s.opportunity.deadline && !s.opportunity.rollingDeadline)
    .sort((a, b) => new Date(a.opportunity!.deadline!).getTime() - new Date(b.opportunity!.deadline!).getTime());

  const rolling = saved.filter((s) => s.opportunity?.rollingDeadline);

  if (withDeadlines.length === 0 && rolling.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No deadlines to show"
        description="Save opportunities from Discover to see their deadlines here."
        action={{ label: "Explore Opportunities", href: "/discover" }}
        className="mt-6"
      />
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {withDeadlines.length > 0 && (
        <ul className="divide-y rounded-xl border bg-card">
          {withDeadlines.map((s) => {
            const opp = s.opportunity!;
            const info = getDeadlineInfo(opp.deadline, false);
            return (
              <li key={s.opportunityId}>
                <Link href={`/opportunities/${opp.slug}`} className="flex items-center gap-3 p-4 hover:bg-muted/50">
                  <OrgAvatar name={opp.organization?.name ?? opp.title} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{opp.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {opp.organization?.name} · {formatDate(opp.deadline)}
                    </p>
                  </div>
                  <DeadlineBadge deadline={opp.deadline} rollingDeadline={false} className="shrink-0" />
                  {info.daysLeft !== null && info.daysLeft >= 0 && (
                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                      {info.daysLeft} day{info.daysLeft === 1 ? "" : "s"} remaining
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {rolling.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Rolling deadlines</h2>
          <ul className="divide-y rounded-xl border bg-card">
            {rolling.map((s) => {
              const opp = s.opportunity!;
              return (
                <li key={s.opportunityId}>
                  <Link href={`/opportunities/${opp.slug}`} className="flex items-center gap-3 p-4 hover:bg-muted/50">
                    <OrgAvatar name={opp.organization?.name ?? opp.title} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{opp.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{opp.organization?.name}</p>
                    </div>
                    <DeadlineBadge deadline={null} rollingDeadline className="shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
