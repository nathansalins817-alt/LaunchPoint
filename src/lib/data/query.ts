import type { Opportunity } from "../types";
import { US_STATES } from "../types";
import { getDeadlineInfo } from "../deadline";
import type { OpportunityFilters } from "./filters";
import type { SortKey } from "../constants";

/**
 * Pure, client-safe filtering/sorting logic shared by the server-rendered
 * Discover page (initial results) and DiscoverView's client-side re-filter
 * on every checkbox change. Kept in its own module - with no Supabase or
 * "server-only" imports - so Client Components can import it directly
 * without pulling the repository layer (lib/data/index.ts) into the
 * browser bundle.
 */

function matchesQuery(o: Opportunity, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    o.title,
    o.organization?.name ?? "",
    o.category,
    o.shortDescription,
    o.description,
    ...o.fields,
    ...o.tags,
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((term) => haystack.includes(term));
}

function matchesCost(o: Opportunity, key: string): boolean {
  const cost = o.cost;
  switch (key) {
    case "free":
      return cost === null || cost === 0;
    case "paid":
      return cost !== null && cost > 0;
    case "under-500":
      return cost !== null && cost > 0 && cost < 500;
    case "500-2000":
      return cost !== null && cost >= 500 && cost <= 2000;
    case "2000-plus":
      return cost !== null && cost > 2000;
    case "financial-aid":
      return o.financialAid;
    default:
      return true;
  }
}

function matchesLocation(o: Opportunity, key: string): boolean {
  switch (key) {
    case "Remote":
      return o.remote;
    case "Other U.S.":
      // Anything U.S.-based that isn't one of the explicitly named states,
      // including nationwide/rotating programs with no single fixed state.
      return o.country === "United States" && !(US_STATES as readonly string[]).includes(o.state ?? "");
    case "International":
      return o.country !== "United States";
    default:
      return o.state === key;
  }
}

function matchesGrade(o: Opportunity, key: string): boolean {
  if (key === "Graduating senior") return o.gradSeniorsEligible;
  return o.eligibleGrades.includes(Number(key) as never);
}

function matchesDeadline(o: Opportunity, key: string): boolean {
  if (key === "rolling") return o.rollingDeadline;
  const { daysLeft } = getDeadlineInfo(o.deadline, o.rollingDeadline);
  if (daysLeft === null || daysLeft < 0) return false;
  if (key === "this-week") return daysLeft <= 7;
  if (key === "this-month") return daysLeft <= 31;
  if (key === "next-3-months") return daysLeft <= 93;
  return true;
}

export function applyFilters(items: Opportunity[], filters: OpportunityFilters): Opportunity[] {
  return items.filter((o) => {
    if (filters.query && !matchesQuery(o, filters.query)) return false;
    if (filters.categories?.length && !filters.categories.includes(o.category)) return false;
    if (filters.fields?.length && !filters.fields.some((f) => o.fields.includes(f as never))) return false;
    if (filters.grades?.length && !filters.grades.some((g) => matchesGrade(o, g))) return false;
    if (filters.locations?.length && !filters.locations.some((l) => matchesLocation(o, l))) return false;
    if (filters.costs?.length && !filters.costs.some((c) => matchesCost(o, c))) return false;
    if (filters.formats?.length && !filters.formats.includes(o.format)) return false;
    if (filters.deadlines?.length && !filters.deadlines.some((d) => matchesDeadline(o, d))) return false;
    return true;
  });
}

export function sortOpportunities(items: Opportunity[], sort: SortKey): Opportunity[] {
  const copy = [...items];
  switch (sort) {
    case "deadline":
      return copy.sort((a, b) => {
        const da = getDeadlineInfo(a.deadline, a.rollingDeadline).daysLeft;
        const db = getDeadlineInfo(b.deadline, b.rollingDeadline).daysLeft;
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      });
    case "recent":
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "az":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "popular":
      // No real usage data yet - falls back to the same ordering as
      // "recommended" until saved_opportunities counts exist to sort by.
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
    case "recommended":
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}
