"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateSavedOpportunityStatus } from "@/lib/actions/saved";
import { SAVED_STATUSES, type SavedStatus } from "@/lib/types";

export function StatusSelect({ opportunityId, status }: { opportunityId: string; status: SavedStatus }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleChange(value: string) {
    setPending(true);
    await updateSavedOpportunityStatus(opportunityId, value as SavedStatus);
    router.refresh();
    setPending(false);
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger size="sm" className="h-7 w-full text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SAVED_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
