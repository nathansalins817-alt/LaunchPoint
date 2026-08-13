"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, Clock, CalendarClock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import { sendDueRemindersNow } from "@/lib/actions/admin-reminders";
import type { ProcessRemindersResult } from "@/lib/reminders-worker";

export function RemindersPanel({ due, scheduled, sentToday }: { due: number; scheduled: number; sentToday: number }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<ProcessRemindersResult | null>(null);

  async function run() {
    setPending(true);
    setResult(null);
    const outcome = await sendDueRemindersNow();
    setResult(outcome);
    router.refresh();
    setPending(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Deadline Reminders</h2>
        <Button size="sm" onClick={run} disabled={pending || due === 0}>
          <Send className="size-4" />
          {pending ? "Sending..." : `Send ${due > 0 ? `${due} ` : ""}Due Reminders Now`}
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <StatCard label="Due now" value={due} icon={Clock} />
        <StatCard label="Scheduled" value={scheduled} icon={CalendarClock} />
        <StatCard label="Sent today" value={sentToday} icon={Mail} />
      </div>

      {result && (
        <div className="mt-3 rounded-lg border bg-card p-3 text-sm">
          <p className="text-foreground">
            Processed {result.processed} · Sent {result.sent} · Failed {result.failed}
            {result.skipped > 0 ? ` · Skipped ${result.skipped}` : ""}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-1.5 space-y-0.5 text-xs text-destructive">
              {result.errors.slice(0, 5).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
