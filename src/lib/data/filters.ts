import { CATEGORIES, FIELDS, FORMATS, type Category, type Format } from "../types";
import { COST_FILTERS, DEADLINE_FILTERS, GRADE_FILTERS, LOCATION_FILTERS, SORT_OPTIONS, type CostFilterKey, type DeadlineFilterKey, type SortKey } from "../constants";

export interface OpportunityFilters {
  query?: string;
  categories?: Category[];
  fields?: string[];
  grades?: string[];
  locations?: string[];
  costs?: CostFilterKey[];
  formats?: Format[];
  deadlines?: DeadlineFilterKey[];
}

export const EMPTY_FILTERS: OpportunityFilters = {};

export function isFiltersEmpty(filters: OpportunityFilters): boolean {
  return (
    !filters.query &&
    !filters.categories?.length &&
    !filters.fields?.length &&
    !filters.grades?.length &&
    !filters.locations?.length &&
    !filters.costs?.length &&
    !filters.formats?.length &&
    !filters.deadlines?.length
  );
}

export function countActiveFilters(filters: OpportunityFilters): number {
  return (
    (filters.categories?.length ?? 0) +
    (filters.fields?.length ?? 0) +
    (filters.grades?.length ?? 0) +
    (filters.locations?.length ?? 0) +
    (filters.costs?.length ?? 0) +
    (filters.formats?.length ?? 0) +
    (filters.deadlines?.length ?? 0)
  );
}

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function toList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function intersect<T extends string>(values: string[], allowed: readonly T[]): T[] {
  const set = new Set<string>(allowed);
  return values.filter((v): v is T => set.has(v));
}

/** Parses Discover's URL search params into typed filters. Works from both
 * a Server Component's `searchParams` prop and the client's `useSearchParams()`. */
export function parseFiltersFromParams(params: SearchParamsRecord): OpportunityFilters {
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  const filters: OpportunityFilters = {
    query: query?.trim() || undefined,
    categories: intersect(toList(params.category), CATEGORIES),
    fields: intersect(toList(params.field), FIELDS),
    grades: intersect(toList(params.grade), GRADE_FILTERS),
    locations: intersect(toList(params.location), LOCATION_FILTERS),
    costs: intersect(
      toList(params.cost),
      COST_FILTERS.map((c) => c.key)
    ),
    formats: intersect(toList(params.format), FORMATS),
    deadlines: intersect(
      toList(params.deadline),
      DEADLINE_FILTERS.map((d) => d.key)
    ),
  };
  return filters;
}

export function parseSortFromParams(params: SearchParamsRecord): SortKey {
  const raw = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const match = SORT_OPTIONS.find((s) => s.key === raw);
  return match?.key ?? "recommended";
}

/** Serializes filters + sort back into URL search params for shareable links. */
export function filtersToSearchParams(filters: OpportunityFilters, sort: SortKey): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.categories?.length) params.set("category", filters.categories.join(","));
  if (filters.fields?.length) params.set("field", filters.fields.join(","));
  if (filters.grades?.length) params.set("grade", filters.grades.join(","));
  if (filters.locations?.length) params.set("location", filters.locations.join(","));
  if (filters.costs?.length) params.set("cost", filters.costs.join(","));
  if (filters.formats?.length) params.set("format", filters.formats.join(","));
  if (filters.deadlines?.length) params.set("deadline", filters.deadlines.join(","));
  if (sort !== "recommended") params.set("sort", sort);
  return params;
}
