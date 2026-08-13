import { Skeleton } from "@/components/ui/skeleton";
import { OpportunityGridSkeleton } from "@/components/opportunity-card-skeleton";

export default function DiscoverLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      <Skeleton className="mt-6 h-10 w-full" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <Skeleton className="h-96 w-full" />
        </div>
        <OpportunityGridSkeleton count={6} />
      </div>
    </div>
  );
}
