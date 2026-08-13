import Link from "next/link";
import type { Metadata } from "next";
import { Radar, Search, AlertTriangle, Copy, RefreshCw, LinkIcon } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { DiscoveryQueue } from "@/components/admin/discovery-queue";
import { ChangesQueue } from "@/components/admin/changes-queue";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getDiscoveryStats,
  listDiscoveredByStatus,
  listPendingChanges,
  listRecentRuns,
  listFailedRuns,
} from "@/lib/data/admin";

export const metadata: Metadata = { title: "Discovery" };

export default async function AdminDiscoveryPage() {
  const [stats, newItems, needsReview, duplicates, changes, recentRuns, failedRuns] = await Promise.all([
    getDiscoveryStats(),
    listDiscoveredByStatus("new"),
    listDiscoveredByStatus("needs_review"),
    listDiscoveredByStatus("possible_duplicate"),
    listPendingChanges(),
    listRecentRuns(8),
    listFailedRuns(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Discovery</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Semi-automated pipeline for finding new opportunities from approved sources.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/discovery/sources">Manage Sources</Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatCard label="Sources monitored" value={stats.sourcesMonitored} icon={Radar} />
        <StatCard label="Discovered this month" value={stats.discoveredThisMonth} icon={Search} />
        <StatCard label="Pending verification" value={stats.needsReview} icon={AlertTriangle} />
        <StatCard label="Possible duplicates" value={stats.possibleDuplicates} icon={Copy} />
        <StatCard label="Changes detected" value={stats.pendingChanges} icon={RefreshCw} />
        <StatCard label="Broken links" value={stats.brokenLinks} icon={LinkIcon} />
      </div>

      <Tabs defaultValue="new" className="mt-8">
        <TabsList>
          <TabsTrigger value="new">New Discoveries</TabsTrigger>
          <TabsTrigger value="review">Needs Review</TabsTrigger>
          <TabsTrigger value="duplicates">Possible Duplicates</TabsTrigger>
          <TabsTrigger value="changes">Changed Opportunities</TabsTrigger>
          <TabsTrigger value="failed">Failed Scans</TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          <DiscoveryQueue
            items={newItems}
            emptyMessage="No new discoveries yet. Add an approved source and run a scan to start populating this queue."
          />
        </TabsContent>
        <TabsContent value="review">
          <DiscoveryQueue items={needsReview} emptyMessage="Nothing is waiting on review right now." />
        </TabsContent>
        <TabsContent value="duplicates">
          <DiscoveryQueue items={duplicates} emptyMessage="No possible duplicates flagged." showDuplicateBadge />
        </TabsContent>
        <TabsContent value="changes">
          <ChangesQueue changes={changes} />
        </TabsContent>
        <TabsContent value="failed">
          {failedRuns.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No failed scans.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {failedRuns.map((run) => (
                <li key={run.id} className="rounded-lg border bg-card p-3 text-sm">
                  <p className="font-medium text-foreground">{run.sourceName}</p>
                  <p className="mt-0.5 text-xs text-destructive">{run.errors ?? "Unknown error"}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{new Date(run.started_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-10">
        <h2 className="text-sm font-semibold text-foreground">Recent Discovery Activity</h2>
        {recentRuns.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No scans have run yet.</p>
        ) : (
          <ul className="mt-3 divide-y rounded-xl border bg-card">
            {recentRuns.map((run) => (
              <li key={run.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{run.sourceName} checked</p>
                  <p className="text-xs text-muted-foreground">
                    {run.status === "completed"
                      ? `${run.opportunities_found} new opportunities found`
                      : run.status === "failed"
                        ? run.errors || "Scan failed"
                        : "Scan in progress"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{new Date(run.started_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
