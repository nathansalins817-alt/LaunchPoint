"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resolveReport } from "@/lib/actions/admin-reports";

export function ReportActions({ id }: { id: string }) {
  const router = useRouter();

  async function run(status: "resolved" | "dismissed") {
    await resolveReport(id, status);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => run("resolved")}>
        Mark Resolved
      </Button>
      <Button size="sm" variant="outline" onClick={() => run("dismissed")}>
        Dismiss
      </Button>
    </div>
  );
}
