import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, MapPin, GraduationCap, DollarSign, Laptop2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrgAvatar } from "@/components/org-avatar";
import { SaveButton } from "@/components/save-button";
import { DeadlineBadge } from "@/components/deadline-badge";
import { OpportunityTimeline } from "@/components/opportunity/timeline";
import { VerificationBadge } from "@/components/opportunity/verification-badge";
import { ReportDialog } from "@/components/opportunity/report-dialog";
import { MatchScore } from "@/components/opportunity/match-score";
import { getOpportunityBySlug, getAllPublishedOpportunities } from "@/lib/data";
import { getSavedOpportunityIds } from "@/lib/data/saved";
import { getCurrentProfile } from "@/lib/auth";
import { formatCost, formatDate, formatGrades, formatLocation } from "@/lib/format";
import { computeMatch } from "@/lib/match";

export async function generateMetadata({ params }: PageProps<"/opportunities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = await getOpportunityBySlug(slug);
  if (!opportunity) return {};

  const title = `${opportunity.title} | LaunchPoint`;
  const description = opportunity.shortDescription;

  return {
    title: opportunity.title,
    description,
    alternates: { canonical: `/opportunities/${opportunity.slug}` },
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

export async function generateStaticParams() {
  const opportunities = await getAllPublishedOpportunities();
  return opportunities.map((o) => ({ slug: o.slug }));
}

export default async function OpportunityDetailPage({ params }: PageProps<"/opportunities/[slug]">) {
  const { slug } = await params;
  const [opportunity, savedIds, profile] = await Promise.all([
    getOpportunityBySlug(slug),
    getSavedOpportunityIds(),
    getCurrentProfile(),
  ]);

  if (!opportunity || opportunity.status === "rejected") notFound();

  const org = opportunity.organization;
  const match = profile ? computeMatch(profile, opportunity) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: opportunity.title,
    description: opportunity.shortDescription,
    provider: org ? { "@type": "Organization", name: org.name, url: org.website } : undefined,
    applicationStartDate: opportunity.applicationOpenDate ?? undefined,
    applicationDeadline: opportunity.rollingDeadline ? undefined : (opportunity.deadline ?? undefined),
    startDate: opportunity.programStartDate ?? undefined,
    endDate: opportunity.programEndDate ?? undefined,
    offers: {
      "@type": "Offer",
      price: opportunity.cost ?? 0,
      priceCurrency: "USD",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link href="/discover" className="hover:text-foreground">
          Discover
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{opportunity.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <OrgAvatar name={org?.name ?? opportunity.title} size="xl" />
            <div className="min-w-0 flex-1">
              {opportunity.featured && <Badge className="mb-2">Featured</Badge>}
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{opportunity.title}</h1>
              {org && (
                <Link href={`/organizations/${org.slug}`} className="mt-1 inline-block text-muted-foreground hover:text-foreground hover:underline">
                  {org.name}
                </Link>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {opportunity.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border bg-card p-4 sm:grid-cols-4">
            <div>
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> Location
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{formatLocation(opportunity)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                <GraduationCap className="size-3.5" /> Eligibility
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {formatGrades(opportunity.eligibleGrades, opportunity.gradSeniorsEligible)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="size-3.5" /> Cost
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{formatCost(opportunity.cost)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                <Laptop2 className="size-3.5" /> Format
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground capitalize">{opportunity.format}</dd>
            </div>
          </dl>

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">About This Opportunity</h2>
            <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-muted-foreground">
              {opportunity.description}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">Eligibility</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Grade</dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {formatGrades(opportunity.eligibleGrades, opportunity.gradSeniorsEligible)}
                </dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Age</dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {opportunity.minAge || opportunity.maxAge
                    ? `${opportunity.minAge ?? "Any"}–${opportunity.maxAge ?? "Any"} years old`
                    : "Not specified"}
                </dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Citizenship / Residency</dt>
                <dd className="mt-0.5 text-sm text-foreground">{opportunity.citizenshipRequirement ?? "Not specified"}</dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Location</dt>
                <dd className="mt-0.5 text-sm text-foreground">{formatLocation(opportunity)}</dd>
              </div>
            </dl>
            {opportunity.eligibilityDescription && (
              <p className="mt-3 text-sm text-muted-foreground">{opportunity.eligibilityDescription}</p>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">Important Dates</h2>
            <div className="mt-4">
              <OpportunityTimeline
                applicationOpenDate={opportunity.applicationOpenDate}
                deadline={opportunity.deadline}
                rollingDeadline={opportunity.rollingDeadline}
                decisionDate={opportunity.decisionDate}
                programStartDate={opportunity.programStartDate}
                programEndDate={opportunity.programEndDate}
              />
            </div>
          </section>

          {opportunity.activities.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-foreground">What You&rsquo;ll Do</h2>
              <ul className="mt-3 space-y-2">
                {opportunity.activities.map((activity) => (
                  <li key={activity} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    {activity}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">Cost & Financial Aid</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Program cost: </span>
                {formatCost(opportunity.cost)}
              </li>
              <li>
                <span className="font-medium text-foreground">Student pay: </span>
                {opportunity.paid
                  ? `Paid${opportunity.stipendAmount ? ` — approximately $${opportunity.stipendAmount.toLocaleString()} stipend` : ""}`
                  : "This is not a paid position."}
              </li>
              <li>
                <span className="font-medium text-foreground">Financial aid: </span>
                {opportunity.financialAid ? "Available — see the official website for details." : "Not indicated by the source."}
              </li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-foreground">Helpful Links</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a href={opportunity.applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                  Application <ExternalLink className="size-3.5" />
                </a>
              </li>
              <li>
                <a href={opportunity.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                  Official Program Website <ExternalLink className="size-3.5" />
                </a>
              </li>
              {opportunity.faqUrl && (
                <li>
                  <a href={opportunity.faqUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    FAQ <ExternalLink className="size-3.5" />
                  </a>
                </li>
              )}
              {org && (
                <li>
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    Organization Website <ExternalLink className="size-3.5" />
                  </a>
                </li>
              )}
            </ul>
          </section>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
            <VerificationBadge status={opportunity.verificationStatus} lastVerifiedAt={opportunity.lastVerifiedAt} />
            <ReportDialog opportunityId={opportunity.id} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-xl border bg-card p-5">
            {match && <MatchScore score={match.score} reasons={match.reasons} />}
            <div className={match ? "mt-4 flex flex-col gap-2" : "flex flex-col gap-2"}>
              <DeadlineBadge deadline={opportunity.deadline} rollingDeadline={opportunity.rollingDeadline} className="w-fit" />
              <p className="text-sm text-muted-foreground">
                {opportunity.deadline && !opportunity.rollingDeadline
                  ? `Deadline: ${formatDate(opportunity.deadline)}`
                  : "Rolling admissions"}
              </p>
            </div>

            <Button size="lg" className="mt-4 w-full" asChild>
              <a href={opportunity.applicationUrl} target="_blank" rel="noopener noreferrer">
                Visit Application Website
                <ExternalLink className="size-4" />
              </a>
            </Button>
            <SaveButton opportunityId={opportunity.id} initialSaved={savedIds.has(opportunity.id)} variant="full" className="mt-2 w-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}
