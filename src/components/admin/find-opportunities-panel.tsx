"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findNewOpportunitiesNow } from "@/lib/actions/admin-discovery";
import type { ProcessDiscoveryResult } from "@/lib/discovery/worker";

/** The spec's headline feature: one prominent button that scans every active
 * discovery source right now and reports back what it found. Everything it
 * finds still lands in the private inbox below - this button never
 * publishes anything itself. */
export function FindOpportunitiesPanel({ pendingInbox }: { pendingInbox: number }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<ProcessDiscoveryResult | null>(null);

  async function run() {
    setPending(true);
    setResult(null);
    const outcome = await findNewOpportunitiesNow();
    setResult(outcome);
    router.refresh();
    setPending(false);
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Opportunity Discovery</h2>
          <p className="text-sm text-muted-foreground">Search every approved source for new opportunities right now.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="relative">
            <Link href="/admin/discovery">
              Opportunity Inbox
              {pendingInbox > 0 && (
                <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-semibold text-destructive-foreground">
                  {pendingInbox > 99 ? "99+" : pendingInbox}
                </span>
              )}
            </Link>
          </Button>
          <Button onClick={run} disabled={pending} size="lg">
            <Search className="size-4" />
            {pending ? "Searching..." : "🔎 Find New Opportunities"}
          </Button>
        </div>
      </div>

      {result && (
        <div className="mt-4 rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="text-foreground">
            {result.opportunitiesFound} new opportunit{result.opportunitiesFound === 1 ? "y" : "ies"} found from{" "}
            {result.sourcesScanned} source{result.sourcesScanned === 1 ? "" : "s"}.
            {result.highMatchCount > 0 && ` ${result.highMatchCount} have a match score above 85.`}
          </p>
          {result.failures > 0 && <p className="mt-1 text-xs text-destructive">{result.failures} source(s) failed to scan.</p>}
          {result.errors.length > 0 && (
            <ul className="mt-1.5 space-y-0.5 text-xs text-destructive">
              {result.errors.slice(0, 5).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
