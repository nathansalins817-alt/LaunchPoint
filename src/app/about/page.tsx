import type { Metadata } from "next";
import Link from "next/link";
import { Search, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlatformStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "LaunchPoint organizes internships, scholarships, research programs, and more into one searchable platform for high school students.",
};

export default async function AboutPage() {
  const stats = await getPlatformStats();

  return (
    <div>
      <section className="border-b bg-card/50">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Opportunity shouldn&rsquo;t depend on knowing where to look.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Thousands of valuable programs exist for high school students — but finding them means digging through
            university websites, company career pages, nonprofit newsletters, and outdated PDFs. LaunchPoint
            organizes all of it into one searchable platform.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-card p-8">
          <h2 className="text-sm font-semibold tracking-wide text-primary uppercase">Our Mission</h2>
          <p className="mt-3 text-xl font-medium text-foreground">
            Help every student discover opportunities that match their interests, regardless of whether they
            already know where to search.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Search className="size-5" />
            </span>
            <h3 className="mt-3 font-semibold text-foreground">One place to search</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Internships, research, scholarships, competitions, and volunteering — filterable by what actually
              matters to you.
            </p>
          </div>
          <div>
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <h3 className="mt-3 font-semibold text-foreground">Built on real verification</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Every listing shows when it was last verified, so you know exactly how much to trust it — not just a
              database that assumes everything is accurate.
            </p>
          </div>
          <div>
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Users className="size-5" />
            </span>
            <h3 className="mt-3 font-semibold text-foreground">Made for students first</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              No paywalls to browse, no login required to search. Accounts only unlock saving, tracking, and
              matching — never basic access.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border bg-card p-8">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Platform statistics</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Real counts from the current catalog — not usage claims. We&rsquo;ll add participation metrics here once we
            have real activity to report.
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <dt className="text-2xl font-semibold text-foreground">{stats.opportunityCount}</dt>
              <dd className="mt-1 text-xs text-muted-foreground">Opportunities listed</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold text-foreground">{stats.fieldCount}</dt>
              <dd className="mt-1 text-xs text-muted-foreground">Fields covered</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold text-foreground">{stats.stateCount}</dt>
              <dd className="mt-1 text-xs text-muted-foreground">States represented</dd>
            </div>
          </dl>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-foreground">Know an opportunity we&rsquo;re missing?</h2>
          <p className="mt-2 text-muted-foreground">Students, counselors, and organizations can all suggest a listing for review.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/discover">Explore Opportunities</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/submit">Submit an Opportunity</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
