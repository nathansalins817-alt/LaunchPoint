import Link from "next/link";
import { ArrowRight, Search, Bookmark, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { CategoryCard } from "@/components/category-card";
import { OpportunityCard } from "@/components/opportunity-card";
import { getFeaturedOpportunities, getPlatformStats, getCategoryCounts, getFieldCounts } from "@/lib/data";
import { getSavedOpportunityIds } from "@/lib/data/saved";
import { CATEGORY_META, FEATURED_FIELD_GROUPS } from "@/lib/constants";
import { CATEGORIES } from "@/lib/types";

export default async function HomePage() {
  const [featured, stats, categoryCounts, fieldCounts, savedIds] = await Promise.all([
    getFeaturedOpportunities(6),
    getPlatformStats(),
    getCategoryCounts(),
    getFieldCounts(),
    getSavedOpportunityIds(),
  ]);

  const categoryCards = CATEGORIES.map((c) => ({ meta: CATEGORY_META[c], count: categoryCounts[c] ?? 0 }));
  const fieldGroupCards = FEATURED_FIELD_GROUPS.map((g) => ({
    group: g,
    count: g.fields.reduce((sum, f) => sum + (fieldCounts[f] ?? 0), 0),
  }));

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,var(--accent),transparent)]"
        />
        <div className="mx-auto max-w-5xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-24 lg:px-8">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Find opportunities that can change your future.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
            Discover internships, research programs, scholarships, competitions, summer programs, and volunteer
            opportunities built for high school students.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar size="lg" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/discover">
                Explore Opportunities
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">How It Works</Link>
            </Button>
          </div>

          <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <dt className="text-3xl font-semibold text-foreground">{stats.opportunityCount}+</dt>
              <dd className="mt-1 text-sm text-muted-foreground">Opportunities</dd>
            </div>
            <div>
              <dt className="text-3xl font-semibold text-foreground">{stats.fieldCount}+</dt>
              <dd className="mt-1 text-sm text-muted-foreground">Fields</dd>
            </div>
            <div>
              <dt className="text-3xl font-semibold text-foreground">{stats.stateCount}+</dt>
              <dd className="mt-1 text-sm text-muted-foreground">Opportunities Across the U.S.</dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Explore by category</h2>
            <p className="mt-2 text-muted-foreground">Every kind of opportunity, organized so you can find yours fast.</p>
          </div>
          <Link href="/categories" className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:block">
            View all categories
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoryCards.map(({ meta, count }) => (
            <CategoryCard
              key={meta.category}
              href={`/discover?category=${encodeURIComponent(meta.category)}`}
              label={meta.label}
              description={meta.description}
              icon={meta.icon}
              count={count}
            />
          ))}
          {fieldGroupCards.map(({ group, count }) => (
            <CategoryCard
              key={group.label}
              href={`/discover?field=${encodeURIComponent(group.fields[0])}`}
              label={group.label}
              description={group.description}
              icon={group.icon}
              count={count}
            />
          ))}
        </div>
      </section>

      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Featured opportunities
              </h2>
              <p className="mt-2 text-muted-foreground">A snapshot of what&rsquo;s available right now.</p>
            </div>
            <Link href="/discover" className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:block">
              View all opportunities
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} saved={savedIds.has(opportunity.id)} />
            ))}
          </div>

          <div className="mt-8 flex justify-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/discover">View all opportunities</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">How LaunchPoint works</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Go from &ldquo;what&rsquo;s out there?&rdquo; to a tracked application in three steps.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Search,
              title: "Search & filter",
              description: "Filter by interest, grade, location, and cost to see only what fits you.",
            },
            {
              icon: Bookmark,
              title: "Save & compare",
              description: "Bookmark opportunities and see a transparent match score for each one.",
            },
            {
              icon: SendHorizonal,
              title: "Apply with confidence",
              description: "Track deadlines and application status in one lightweight tracker.",
            },
          ].map((step, i) => (
            <div key={step.title} className="relative rounded-xl border bg-card p-6">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <step.icon className="size-5" />
              </span>
              <p className="mt-4 text-xs font-semibold text-primary">Step {i + 1}</p>
              <h3 className="mt-1 font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Create a free account to save opportunities and get matched.
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
            Browsing is always open. Sign up when you&rsquo;re ready to save opportunities, track deadlines, and get
            personalized recommendations.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/discover">Browse without an account</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
