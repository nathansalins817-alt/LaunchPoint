import Link from "next/link";
import type { Metadata } from "next";
import { ListChecks, CheckCircle2, CalendarClock, Inbox, Users } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { RemindersPanel } from "@/components/admin/reminders-panel";
import { Button } from "@/components/ui/button";
import { getAdminStats, listPendingSubmissions, getReminderStats } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const [stats, pendingSubmissions, reminderStats] = await Promise.all([
    getAdminStats(),
    listPendingSubmissions(),
    getReminderStats(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admin Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">A snapshot of the LaunchPoint catalog.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total opportunities" value={stats.totalOpportunities} icon={ListChecks} />
        <StatCard label="Active opportunities" value={stats.activeOpportunities} icon={CheckCircle2} />
        <StatCard label="Deadlines (30 days)" value={stats.upcomingDeadlines} icon={CalendarClock} />
        <StatCard label="Pending submissions" value={stats.pendingSubmissions} icon={Inbox} />
        <StatCard label="Registered users" value={stats.registeredUsers} icon={Users} />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent submissions</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/submissions">View all</Link>
        </Button>
      </div>

      {pendingSubmissions.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No pending submissions right now.</p>
      ) : (
        <ul className="mt-4 divide-y rounded-xl border bg-card">
          {pendingSubmissions.slice(0, 5).map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{s.opportunity_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.organization_name} · Submitted {formatDate(s.submitted_at.slice(0, 10))}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/submissions">Review</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10">
        <RemindersPanel due={reminderStats.due} scheduled={reminderStats.scheduled} sentToday={reminderStats.sentToday} />
      </div>

      <div className="mt-10 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/opportunities/new">New opportunity</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/organizations/new">New organization</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/discovery/sources">Manage discovery sources</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
