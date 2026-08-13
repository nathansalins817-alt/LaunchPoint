"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrgAvatar } from "@/components/org-avatar";
import { cn } from "@/lib/utils";
import { getDeadlineInfo } from "@/lib/deadline";
import type { SavedOpportunity } from "@/lib/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DeadlinesCalendar({ saved }: { saved: SavedOpportunity[] }) {
  const today = new Date();
  const [month, setMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  const byDate = React.useMemo(() => {
    const map = new Map<string, SavedOpportunity[]>();
    for (const s of saved) {
      if (!s.opportunity?.deadline || s.opportunity.rollingDeadline) continue;
      const key = s.opportunity.deadline;
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return map;
  }, [saved]);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1)),
  ];

  const selectedItems = selectedKey ? (byDate.get(selectedKey) ?? []) : [];

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;
          const key = toKey(date);
          const items = byDate.get(key) ?? [];
          const isToday = toKey(today) === key;
          const isSelected = selectedKey === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedKey(items.length > 0 ? key : null)}
              disabled={items.length === 0}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-muted font-semibold text-foreground" : "text-foreground hover:bg-muted disabled:hover:bg-transparent",
                items.length === 0 && "text-muted-foreground/60"
              )}
            >
              {date.getDate()}
              {items.length > 0 && (
                <span className="flex gap-0.5">
                  {items.slice(0, 3).map((s) => (
                    <span
                      key={s.opportunityId}
                      className={cn(
                        "size-1.5 rounded-full",
                        isSelected ? "bg-primary-foreground" : "bg-primary"
                      )}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedItems.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">
            Due{" "}
            {new Date(`${selectedKey}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </h3>
          <ul className="mt-3 space-y-2">
            {selectedItems.map((s) => {
              const opp = s.opportunity!;
              const info = getDeadlineInfo(opp.deadline, false);
              return (
                <li key={s.opportunityId}>
                  <Link href={`/opportunities/${opp.slug}`} className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-muted/50">
                    <OrgAvatar name={opp.organization?.name ?? opp.title} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{opp.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{opp.organization?.name}</p>
                    </div>
                    {info.daysLeft !== null && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {info.daysLeft === 0 ? "Today" : `${info.daysLeft}d left`}
                      </span>
                    )}
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
