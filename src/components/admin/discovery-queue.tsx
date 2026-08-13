"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { reviewDiscoveredOpportunity } from "@/lib/actions/admin-discovery";
import type { Database } from "@/lib/supabase/database.types";
import type { ExtractedOpportunityData } from "@/lib/types";

type DiscoveredRow = Database["public"]["Tables"]["discovered_opportunities"]["Row"];

export function DiscoveryQueue({
  items,
  emptyMessage,
  showDuplicateBadge = false,
}: {
  items: DiscoveredRow[];
  emptyMessage: string;
  showDuplicateBadge?: boolean;
}) {
  const router = useRouter();

  if (items.length === 0) {
    return <EmptyState title="Nothing here" description={emptyMessage} className="mt-4" />;
  }

  return (
    <ul className="mt-4 space-y-4">
      {items.map((item) => {
        const extracted = item.extracted_data as unknown as Partial<ExtractedOpportunityData>;
        return (
          <li key={item.id} className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{item.raw_title}</h3>
                  {showDuplicateBadge && <Badge variant="outline">Possible Duplicate</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Discovered {new Date(item.discovered_at).toLocaleDateString()} · Confidence{" "}
                  {Math.round(item.confidence_score * 100)}%
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await reviewDiscoveredOpportunity(item.id, "save_for_later");
                    router.refresh();
                  }}
                >
                  Save for Later
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={async () => {
                    await reviewDiscoveredOpportunity(item.id, "reject");
                    router.refresh();
                  }}
                >
                  Reject
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Extracted Information</p>
                <dl className="mt-2 space-y-1 text-xs text-foreground">
                  <Row label="Category" value={extracted.category} />
                  <Row label="Deadline" value={extracted.deadline} />
                  <Row label="Location" value={extracted.location} />
                  <Row label="Cost" value={extracted.cost != null ? String(extracted.cost) : null} />
                </dl>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Original Source</p>
                <p className="mt-2 line-clamp-4 text-xs text-muted-foreground">{item.raw_content || "No content captured."}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value || "—"}</dd>
    </div>
  );
}
