"use client";

import { CheckCircle2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function MatchScore({ score, reasons }: { score: number; reasons: string[] }) {
  const tone = score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-muted-foreground";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border bg-accent/40 px-3 py-2 text-left transition-colors hover:bg-accent"
        >
          <span className="text-sm font-medium text-foreground">
            <span className={cn("text-base font-semibold", tone)}>{score}%</span> Match
          </span>
          <span className="text-xs text-primary underline-offset-2 hover:underline">Why this matches you</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
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
          <p className="mt-2 text-sm text-muted-foreground">
            Complete your profile interests to see personalized match reasons.
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Calculated from your grade, interests, location, and cost preferences. Never AI-guessed.
        </p>
      </PopoverContent>
    </Popover>
  );
}
