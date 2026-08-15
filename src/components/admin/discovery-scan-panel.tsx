"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RadarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scanDueSourcesNow } from "@/lib/actions/admin-discovery";
import type { ProcessDiscoveryResult } from "@/lib/discovery/worker";

export function DiscoveryScanPanel() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<ProcessDiscoveryResult | null>(null);

  async function run() {
    setPending(true);
    setResult(null);
    const outcome = await scanDueSourcesNow();
    setResult(outcome);
    router.refresh();
    setPending(false);
  }

  return (
    <div>
      <Button variant="outline" onClick={run} disabled={pending}>
        <RadarIcon className="size-4" />
        {pending ? "Scanning..." : "Scan Due Sources Now"}
      </Button>
      {result && (
        <div className="mt-3 rounded-lg border bg-card p-3 text-sm">
          <p className="text-foreground">
            Scanned {result.sourcesScanned} source{result.sourcesScanned === 1 ? "" : "s"} · Found{" "}
            {result.opportunitiesFound} candidate{result.opportunitiesFound === 1 ? "" : "s"}
            {result.sourcesSkipped > 0 ? ` · ${result.sourcesSkipped} not due yet` : ""}
            {result.failures > 0 ? ` · ${result.failures} failed` : ""}
          </p>
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
