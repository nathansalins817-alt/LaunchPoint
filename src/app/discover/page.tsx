import type { Metadata } from "next";
import { DiscoverView } from "@/components/discover/discover-view";
import { getAllPublishedOpportunities } from "@/lib/data";
import { getSavedOpportunityIds } from "@/lib/data/saved";
import { parseFiltersFromParams, parseSortFromParams } from "@/lib/data/filters";

export const metadata: Metadata = {
  title: "Discover Opportunities",
  description: "Find internships, research programs, scholarships, competitions, and summer programs matched to your interests, grade, location, and budget.",
};

export default async function DiscoverPage({ searchParams }: PageProps<"/discover">) {
  const params = await searchParams;
  const [allOpportunities, savedIds] = await Promise.all([getAllPublishedOpportunities(), getSavedOpportunityIds()]);

  return (
    <DiscoverView
      allOpportunities={allOpportunities}
      initialFilters={parseFiltersFromParams(params)}
      initialSort={parseSortFromParams(params)}
      savedIds={[...savedIds]}
    />
  );
}
