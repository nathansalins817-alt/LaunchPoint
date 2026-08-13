"use client";

import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FilterCheckboxGroup } from "./filter-checkbox-group";
import type { OpportunityFilters } from "@/lib/data/filters";
import { countActiveFilters, isFiltersEmpty } from "@/lib/data/filters";
import { CATEGORIES, FIELDS, FORMATS } from "@/lib/types";
import { COST_FILTERS, FORMAT_FILTERS, DEADLINE_FILTERS, GRADE_FILTERS, LOCATION_FILTERS } from "@/lib/constants";

const SECTIONS = ["category", "field", "grade", "location", "cost", "format", "deadline"];

export function FilterPanel({
  filters,
  onChange,
}: {
  filters: OpportunityFilters;
  onChange: (next: OpportunityFilters) => void;
}) {
  const activeCount = countActiveFilters(filters);

  return (
    <div>
      <div className="flex items-center justify-between px-1 pb-3">
        <h2 className="text-sm font-semibold text-foreground">
          Filters {activeCount > 0 && <span className="text-muted-foreground">({activeCount})</span>}
        </h2>
        {!isFiltersEmpty(filters) && (
          <Button variant="ghost" size="sm" onClick={() => onChange({})} className="h-7 px-2 text-xs">
            Clear all filters
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={SECTIONS} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm font-medium">Category</AccordionTrigger>
          <AccordionContent>
            <FilterCheckboxGroup
              options={CATEGORIES.map((c) => ({ key: c, label: c }))}
              selected={filters.categories ?? []}
              onChange={(v) => onChange({ ...filters, categories: v as OpportunityFilters["categories"] })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="field">
          <AccordionTrigger className="text-sm font-medium">Field / Interest</AccordionTrigger>
          <AccordionContent>
            <FilterCheckboxGroup
              options={FIELDS.map((f) => ({ key: f, label: f }))}
              selected={filters.fields ?? []}
              onChange={(v) => onChange({ ...filters, fields: v })}
              scrollable
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="grade">
          <AccordionTrigger className="text-sm font-medium">Grade</AccordionTrigger>
          <AccordionContent>
            <FilterCheckboxGroup
              options={GRADE_FILTERS.map((g) => ({ key: g, label: g === "Graduating senior" ? g : `Grade ${g}` }))}
              selected={filters.grades ?? []}
              onChange={(v) => onChange({ ...filters, grades: v })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location">
          <AccordionTrigger className="text-sm font-medium">Location</AccordionTrigger>
          <AccordionContent>
            <FilterCheckboxGroup
              options={LOCATION_FILTERS.map((l) => ({ key: l, label: l }))}
              selected={filters.locations ?? []}
              onChange={(v) => onChange({ ...filters, locations: v })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cost">
          <AccordionTrigger className="text-sm font-medium">Cost</AccordionTrigger>
          <AccordionContent>
            <FilterCheckboxGroup
              options={[...COST_FILTERS]}
              selected={filters.costs ?? []}
              onChange={(v) => onChange({ ...filters, costs: v as OpportunityFilters["costs"] })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="format">
          <AccordionTrigger className="text-sm font-medium">Opportunity Type</AccordionTrigger>
          <AccordionContent>
            <FilterCheckboxGroup
              options={[...FORMAT_FILTERS]}
              selected={filters.formats ?? []}
              onChange={(v) => onChange({ ...filters, formats: v as (typeof FORMATS)[number][] })}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="deadline" className="border-b-0">
          <AccordionTrigger className="text-sm font-medium">Deadline</AccordionTrigger>
          <AccordionContent>
            <FilterCheckboxGroup
              options={[...DEADLINE_FILTERS]}
              selected={filters.deadlines ?? []}
              onChange={(v) => onChange({ ...filters, deadlines: v as OpportunityFilters["deadlines"] })}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
