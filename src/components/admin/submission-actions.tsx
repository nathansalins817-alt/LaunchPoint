"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { approveSubmission, rejectSubmission } from "@/lib/actions/admin-submissions";

export function SubmissionActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState<"approve" | "reject" | null>(null);

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending !== null}
        onClick={async () => {
          setPending("approve");
          await approveSubmission(id);
        }}
      >
        {pending === "approve" ? "Approving..." : "Approve & Edit"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending !== null}
        onClick={async () => {
          setPending("reject");
          await rejectSubmission(id);
          router.refresh();
          setPending(null);
        }}
      >
        Reject
      </Button>
    </div>
  );
}
