"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Trash2, CheckCircle2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteOpportunity, toggleFeatured, setOpportunityStatus, markVerified } from "@/lib/actions/admin-opportunities";

export function OpportunityRowActions({
  id,
  featured,
  status,
}: {
  id: string;
  featured: boolean;
  status: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function run(fn: () => Promise<void>) {
    setPending(true);
    await fn();
    router.refresh();
    setPending(false);
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/opportunities/${id}/edit`}>Edit</Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={pending} aria-label="More actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => run(() => toggleFeatured(id, !featured))}>
            <Star className={featured ? "fill-current" : ""} />
            {featured ? "Unfeature" : "Feature"}
          </DropdownMenuItem>
          {status !== "expired" && (
            <DropdownMenuItem onSelect={() => run(() => setOpportunityStatus(id, "expired"))}>
              Mark expired
            </DropdownMenuItem>
          )}
          {status !== "published" && (
            <DropdownMenuItem onSelect={() => run(() => setOpportunityStatus(id, "published"))}>
              Publish
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => run(() => markVerified(id))}>
            <CheckCircle2 />
            Mark verified
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              if (confirm("Delete this opportunity? This cannot be undone.")) run(() => deleteOpportunity(id));
            }}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
