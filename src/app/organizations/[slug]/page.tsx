import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { OrgAvatar } from "@/components/org-avatar";
import { OpportunityCard } from "@/components/opportunity-card";
import { EmptyState } from "@/components/empty-state";
import { getOrganizationBySlug, getOpportunitiesByOrganizationSlug } from "@/lib/data";
import { getSavedOpportunityIds } from "@/lib/data/saved";

export async function generateMetadata({ params }: PageProps<"/organizations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);
  if (!org) return {};
  return {
    title: org.name,
    description: org.description || `Opportunities from ${org.name} on LaunchPoint.`,
  };
}

// Rendered on-demand rather than pre-built with generateStaticParams: the
// catalog now changes at runtime (admin approvals from the discovery
// pipeline, direct admin edits), and generateStaticParams can't use the
// session-aware Supabase client anyway (it runs with no request/cookies).
export default async function OrganizationPage({ params }: PageProps<"/organizations/[slug]">) {
  const { slug } = await params;
  const [org, opportunities, savedIds] = await Promise.all([
    getOrganizationBySlug(slug),
    getOpportunitiesByOrganizationSlug(slug),
    getSavedOpportunityIds(),
  ]);

  if (!org) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <OrgAvatar name={org.name} size="xl" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{org.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{org.organizationType}</p>
        </div>
      </div>

      {org.description && <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{org.description}</p>}

      <a
        href={org.website}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        Visit website <ExternalLink className="size-3.5" />
      </a>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-foreground">Opportunities from {org.name}</h2>
        {opportunities.length === 0 ? (
          <EmptyState
            title="No active opportunities"
            description="This organization doesn't have any published opportunities right now."
            className="mt-4"
          />
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} saved={savedIds.has(o.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
