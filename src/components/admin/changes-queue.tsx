"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { reviewOpportunityChange } from "@/lib/actions/admin-discovery";
import type { Database } from "@/lib/supabase/database.types";

type ChangeRow = Database["public"]["Tables"]["opportunity_changes"]["Row"];

export function ChangesQueue({ changes }: { changes: ChangeRow[] }) {
  const router = useRouter();

  if (changes.length === 0) {
    return (
      <EmptyState
        title="No changes detected"
        description="When a re-check finds a difference on an approved source, it shows up here for review before anything updates."
        className="mt-4"
      />
    );
  }

  return (
    <ul className="mt-4 space-y-3">
      {changes.map((c) => (
        <li key={c.id} className="rounded-xl border bg-card p-4">
          <p className="text-sm font-medium text-foreground capitalize">{c.field_name.replace(/_/g, " ")} change detected</p>
          <div className="mt-2 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Current on LaunchPoint</p>
              <p className="text-foreground">{c.old_value || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Source now says</p>
              <p className="text-foreground">{c.new_value || "—"}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            {c.source_url ? (
              <Link href={c.source_url} target="_blank" className="text-xs text-primary hover:underline">
                View source
              </Link>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  await reviewOpportunityChange(c.id, "accept");
                  router.refresh();
                }}
              >
                Accept Change
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await reviewOpportunityChange(c.id, "ignore");
                  router.refresh();
                }}
              >
                Ignore
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
