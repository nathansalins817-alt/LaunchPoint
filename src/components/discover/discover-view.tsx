"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { OpportunityCard } from "@/components/opportunity-card";
import { EmptyState } from "@/components/empty-state";
import { FilterPanel } from "./filter-panel";
import type { Opportunity } from "@/lib/types";
import { applyFilters, sortOpportunities } from "@/lib/data/query";
import { filtersToSearchParams, countActiveFilters, type OpportunityFilters } from "@/lib/data/filters";
import { SORT_OPTIONS, type SortKey } from "@/lib/constants";

export function DiscoverView({
  allOpportunities,
  initialFilters,
  initialSort,
  savedIds,
}: {
  allOpportunities: Opportunity[];
  initialFilters: OpportunityFilters;
  initialSort: SortKey;
  savedIds: string[];
}) {
  const router = useRouter();
  const [filters, setFilters] = React.useState<OpportunityFilters>(initialFilters);
  const [sort, setSort] = React.useState<SortKey>(initialSort);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const savedSet = React.useMemo(() => new Set(savedIds), [savedIds]);

  const results = React.useMemo(() => {
    return sortOpportunities(applyFilters(allOpportunities, filters), sort);
  }, [allOpportunities, filters, sort]);

  function update(nextFilters: OpportunityFilters, nextSort: SortKey = sort) {
    setFilters(nextFilters);
    setSort(nextSort);
    const params = filtersToSearchParams(nextFilters, nextSort);
    const qs = params.toString();
    router.replace(`/discover${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  const activeCount = countActiveFilters(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Discover Opportunities</h1>
        <p className="mt-2 text-muted-foreground">Find programs matched to your interests, goals, and eligibility.</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={filters.query ?? ""}
            onChange={(e) => update({ ...filters, query: e.target.value || undefined })}
            placeholder="Search by title, organization, or keyword..."
            className="h-10 pl-9"
            aria-label="Search opportunities"
          />
        </div>
        <Button
          variant="outline"
          className="gap-2 lg:hidden"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeCount > 0 && <Badge className="ml-0.5 h-5 min-w-5 justify-center px-1">{activeCount}</Badge>}
        </Button>
        <Select value={sort} onValueChange={(v) => update(filters, v as SortKey)}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.key} value={opt.key}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <FilterPanel filters={filters} onChange={(f) => update(f)} />
          </div>
        </aside>

        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {results.length} opportunit{results.length === 1 ? "y" : "ies"} found
          </p>

          {results.length === 0 ? (
            <EmptyState
              title="No exact matches yet."
              description="Try removing a filter or exploring similar opportunities."
              action={{ label: "Clear Filters", onClick: () => update({}) }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} saved={savedSet.has(o.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-full max-w-sm gap-0">
          <SheetHeader className="flex-row items-center justify-between border-b pb-4">
            <SheetTitle>Filters</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close filters">
                <X className="size-4" />
              </Button>
            </SheetClose>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <FilterPanel filters={filters} onChange={(f) => update(f)} />
          </div>
          <SheetFooter className="border-t">
            <Button onClick={() => setMobileFiltersOpen(false)} className="w-full">
              Show {results.length} result{results.length === 1 ? "" : "s"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
