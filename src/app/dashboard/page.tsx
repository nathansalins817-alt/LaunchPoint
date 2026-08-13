import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bookmark, Sparkles } from "lucide-react";
import { OpportunityCard } from "@/components/opportunity-card";
import { EmptyState } from "@/components/empty-state";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { Button } from "@/components/ui/button";
import { requireUser, getCurrentProfile } from "@/lib/auth";
import { getAllPublishedOpportunities } from "@/lib/data";
import { getSavedOpportunities } from "@/lib/data/saved";
import { computeMatch } from "@/lib/match";
import { getGreeting } from "@/lib/greeting";

export const metadata: Metadata = { title: "Your LaunchPoint" };

export default async function DashboardPage() {
  await requireUser();
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");
  if (!profile.onboardingCompleted) redirect("/onboarding");

  const [allOpportunities, saved] = await Promise.all([getAllPublishedOpportunities(), getSavedOpportunities()]);

  const savedIds = new Set(saved.map((s) => s.opportunityId));
  const recommended = allOpportunities
    .filter((o) => !savedIds.has(o.id))
    .map((o) => ({ opportunity: o, match: computeMatch(profile, o) }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Your LaunchPoint</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {getGreeting()}, {profile.firstName || "there"}
          </h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/discover">Explore more opportunities</Link>
        </Button>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Recommended For You</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Matched to your grade, interests, location, and cost preferences.
          </p>

          {recommended.length === 0 ? (
            <EmptyState
              className="mt-4"
              title="No recommendations yet"
              description="Browse Discover and save a few opportunities to sharpen your matches."
              action={{ label: "Go to Discover", href: "/discover" }}
            />
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {recommended.map(({ opportunity, match }) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} saved={savedIds.has(opportunity.id)} match={match} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Upcoming Deadlines</h2>
            <div className="mt-3 rounded-xl border bg-card px-4">
              <UpcomingDeadlines saved={saved} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Saved Opportunities</h2>
              <Link href="/saved" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            {saved.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                className="mt-3"
                title="Nothing saved yet"
                description="Bookmark opportunities you're interested in to track them here."
              />
            ) : (
              <ul className="mt-3 space-y-2.5">
                {saved.slice(0, 5).map((s) => (
                  <li key={s.opportunityId} className="rounded-lg border bg-card p-3">
                    <Link href={`/opportunities/${s.opportunity!.slug}`} className="text-sm font-medium text-foreground hover:text-primary">
                      {s.opportunity!.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
