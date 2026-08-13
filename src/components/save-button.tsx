"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { saveOpportunity, removeSavedOpportunity } from "@/lib/actions/saved";

export function SaveButton({
  opportunityId,
  initialSaved = false,
  variant = "icon",
  className,
}: {
  opportunityId: string;
  initialSaved?: boolean;
  variant?: "icon" | "full";
  className?: string;
}) {
  const [saved, setSaved] = React.useState(initialSaved);
  const [pending, setPending] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    if (!isSupabaseConfigured) {
      toast.info("Saving isn't available yet", { description: "This preview isn't connected to Supabase." });
      return;
    }

    setPending(true);
    const result = saved ? await removeSavedOpportunity(opportunityId) : await saveOpportunity(opportunityId);

    if (result.requiresAuth) {
      router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
      setPending(false);
      return;
    }

    if (result.error) {
      toast.error("Something went wrong", { description: result.error });
    } else if (saved) {
      setSaved(false);
      toast.success("Removed from saved opportunities");
    } else {
      setSaved(true);
      toast.success("Saved to your list", {
        description: "We'll email you as its deadline gets close.",
      });
    }

    router.refresh();
    setPending(false);
  }

  if (variant === "full") {
    return (
      <Button variant="outline" onClick={toggle} disabled={pending} aria-pressed={saved} className={className}>
        <Bookmark className={cn("size-4", saved && "fill-primary text-primary")} />
        {saved ? "Saved" : "Save Opportunity"}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved opportunities" : "Save opportunity"}
      className={cn("shrink-0", className)}
    >
      <Bookmark className={cn("size-4 transition-colors", saved && "fill-primary text-primary")} />
    </Button>
  );
}
