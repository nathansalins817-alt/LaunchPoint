import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { getDeadlineInfo } from "@/lib/deadline";
import type { SavedOpportunity } from "@/lib/types";

export function UpcomingDeadlines({ saved }: { saved: SavedOpportunity[] }) {
  const withDeadlines = saved
    .filter((s) => s.opportunity && s.opportunity.deadline && !s.opportunity.rollingDeadline)
    .map((s) => ({ saved: s, info: getDeadlineInfo(s.opportunity!.deadline, false) }))
    .filter((s) => s.info.daysLeft !== null && s.info.daysLeft >= 0)
    .sort((a, b) => a.info.daysLeft! - b.info.daysLeft!)
    .slice(0, 5);

  if (withDeadlines.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No upcoming deadlines"
        description="Save opportunities with a deadline to track them here."
        className="py-10"
      />
    );
  }

  return (
    <ul className="divide-y">
      {withDeadlines.map(({ saved: s, info }) => (
        <li key={s.opportunityId}>
          <Link
            href={`/opportunities/${s.opportunity!.slug}`}
            className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-muted/50"
          >
            <span className="min-w-0 truncate font-medium text-foreground">{s.opportunity!.title}</span>
            <span className="shrink-0 text-muted-foreground">{info.daysLeft} day{info.daysLeft === 1 ? "" : "s"} remaining</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
