"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/empty-state";
import {
  approveDiscoveredOpportunity,
  denyDiscoveredOpportunity,
  saveDiscoveredOpportunityForLater,
  markDiscoveredOpportunityNeedsVerification,
  addNoteToDiscoveredOpportunity,
  approveDiscoveredOpportunities,
  denyDiscoveredOpportunities,
  approveAllVerifiedDiscoveredOpportunities,
} from "@/lib/actions/admin-discovery";
import { CATEGORIES } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";
import type { ExtractedOpportunityData } from "@/lib/types";

type DiscoveredRow = Database["public"]["Tables"]["discovered_opportunities"]["Row"] & {
  source: { organization_name: string; source_url: string } | null;
};

type SortKey = "relevance" | "deadline" | "discovered";

export function DiscoveryQueue({
  items,
  emptyMessage,
  showDuplicateBadge = false,
  showApproveAllVerified = false,
}: {
  items: DiscoveredRow[];
  emptyMessage: string;
  showDuplicateBadge?: boolean;
  showApproveAllVerified?: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [pendingBulk, setPendingBulk] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [minMatchScore, setMinMatchScore] = React.useState(0);
  const [sortKey, setSortKey] = React.useState<SortKey>("relevance");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items.filter((item) => {
      const extracted = item.extracted_data as unknown as Partial<ExtractedOpportunityData>;
      if (q && !item.raw_title.toLowerCase().includes(q) && !(item.source?.organization_name.toLowerCase().includes(q))) return false;
      if (categoryFilter !== "all" && extracted.category !== categoryFilter) return false;
      if ((item.match_score ?? 0) < minMatchScore) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === "relevance") return (b.match_score ?? 0) - (a.match_score ?? 0);
      if (sortKey === "deadline") {
        const aDeadline = (a.extracted_data as unknown as Partial<ExtractedOpportunityData>).deadline;
        const bDeadline = (b.extracted_data as unknown as Partial<ExtractedOpportunityData>).deadline;
        if (!aDeadline && !bDeadline) return 0;
        if (!aDeadline) return 1;
        if (!bDeadline) return -1;
        return aDeadline.localeCompare(bDeadline);
      }
      return new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime();
    });

    return list;
  }, [items, search, categoryFilter, minMatchScore, sortKey]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((i) => i.id))));
  }

  async function runBulk(action: (ids: string[]) => Promise<void>) {
    setPendingBulk(true);
    await action([...selected]);
    setSelected(new Set());
    router.refresh();
    setPendingBulk(false);
  }

  if (items.length === 0) {
    return <EmptyState title="Nothing here" description={emptyMessage} className="mt-4" />;
  }

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search this queue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={minMatchScore}
          onChange={(e) => setMinMatchScore(Number(e.target.value))}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value={0}>Any match score</option>
          <option value={50}>Match score 50+</option>
          <option value={70}>Match score 70+</option>
          <option value={85}>Match score 85+</option>
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="h-9 rounded-md border bg-background px-2 text-sm">
          <option value="relevance">Sort: Relevance</option>
          <option value="deadline">Sort: Deadline</option>
          <option value="discovered">Sort: Newest</option>
        </select>
        {showApproveAllVerified && (
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            disabled={pendingBulk}
            onClick={async () => {
              setPendingBulk(true);
              await approveAllVerifiedDiscoveredOpportunities();
              router.refresh();
              setPendingBulk(false);
            }}
          >
            Approve All Verified
          </Button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 text-sm">
        <label className="flex items-center gap-2 text-muted-foreground">
          <Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onCheckedChange={toggleAll} />
          Select all ({filtered.length})
        </label>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{selected.size} selected</span>
            <Button size="sm" disabled={pendingBulk} onClick={() => runBulk(approveDiscoveredOpportunities)}>
              Approve Selected
            </Button>
            <Button size="sm" variant="outline" disabled={pendingBulk} onClick={() => runBulk(denyDiscoveredOpportunities)}>
              Deny Selected
            </Button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No matches" description="Nothing in this queue matches your filters." className="mt-4" />
      ) : (
        <ul className="mt-3 space-y-4">
          {filtered.map((item) => (
            <DiscoveryCard
              key={item.id}
              item={item}
              selected={selected.has(item.id)}
              onToggleSelect={() => toggle(item.id)}
              showDuplicateBadge={showDuplicateBadge}
              onChanged={() => router.refresh()}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function DiscoveryCard({
  item,
  selected,
  onToggleSelect,
  showDuplicateBadge,
  onChanged,
}: {
  item: DiscoveredRow;
  selected: boolean;
  onToggleSelect: () => void;
  showDuplicateBadge: boolean;
  onChanged: () => void;
}) {
  const [pending, setPending] = React.useState<string | null>(null);
  const [noteOpen, setNoteOpen] = React.useState(false);
  const [note, setNote] = React.useState(item.admin_note ?? "");
  const extracted = item.extracted_data as unknown as Partial<ExtractedOpportunityData>;

  async function run(name: string, fn: () => Promise<void>) {
    setPending(name);
    await fn();
    onChanged();
    setPending(null);
  }

  return (
    <li className="rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Checkbox checked={selected} onCheckedChange={onToggleSelect} className="mt-1" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground">{item.raw_title}</h3>
              {showDuplicateBadge && <Badge variant="outline">Possible Duplicate</Badge>}
              {item.match_score !== null && <Badge variant="secondary">{item.match_score}% match</Badge>}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.source?.organization_name ?? "Unknown source"} · Discovered {new Date(item.discovered_at).toLocaleDateString()} ·
              Confidence {Math.round(item.confidence_score * 100)}%
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={pending !== null} onClick={() => run("approve", () => approveDiscoveredOpportunity(item.id))}>
            {pending === "approve" ? "Approving..." : "✅ Approve"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
            disabled={pending !== null}
            onClick={() => run("deny", () => denyDiscoveredOpportunity(item.id))}
          >
            {pending === "deny" ? "Denying..." : "❌ Deny"}
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
            <Row label="Format" value={extracted.format} />
            <Row label="Cost" value={extracted.cost != null ? String(extracted.cost) : null} />
            <Row label="Eligibility" value={extracted.eligibilityNotes} />
          </dl>
        </div>
        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Original Source</p>
          <p className="mt-2 line-clamp-4 text-xs text-muted-foreground">{item.raw_content || "No content captured."}</p>
        </div>
      </div>

      {item.admin_note && !noteOpen && <p className="mt-3 rounded-md bg-amber-500/10 p-2 text-xs text-foreground">Note: {item.admin_note}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <Button size="sm" variant="ghost" disabled={pending !== null} onClick={() => run("later", () => saveDiscoveredOpportunityForLater(item.id))}>
          Save for Later
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setNoteOpen((v) => !v)}>
          Add Note
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending !== null}
          onClick={() => run("verify", () => markDiscoveredOpportunityNeedsVerification(item.id))}
        >
          Mark Needs Verification
        </Button>
        {item.source?.source_url && (
          <Button size="sm" variant="ghost" asChild>
            <a href={item.source.source_url} target="_blank" rel="noopener noreferrer">
              Open Source <ExternalLink className="ml-1 size-3" />
            </a>
          </Button>
        )}
      </div>

      {noteOpen && (
        <div className="mt-2 flex gap-2">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for other admins..." className="text-xs" />
          <Button
            size="sm"
            disabled={pending !== null}
            onClick={async () => {
              await run("note", () => addNoteToDiscoveredOpportunity(item.id, note));
              setNoteOpen(false);
            }}
          >
            Save
          </Button>
        </div>
      )}
    </li>
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
