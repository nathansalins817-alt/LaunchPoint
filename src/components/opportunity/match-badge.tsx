"use client";

import { CheckCircle2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function MatchBadge({ score, reasons }: { score: number; reasons: string[] }) {
  const tone = score >= 80 ? "bg-success/10 text-success" : score >= 50 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn("relative z-10 rounded-full px-2 py-0.5 text-xs font-semibold", tone)}
        >
          {score}% Match
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-semibold text-foreground">Why this matches you</p>
        {reasons.length > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                {reason}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Complete your profile to see personalized reasons.</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
