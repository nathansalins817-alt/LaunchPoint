import Link from "next/link";
import { MapPin, GraduationCap, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrgAvatar } from "@/components/org-avatar";
import { SaveButton } from "@/components/save-button";
import { DeadlineBadge } from "@/components/deadline-badge";
import { MatchBadge } from "@/components/opportunity/match-badge";
import type { Opportunity } from "@/lib/types";
import { formatCost, formatGrades, formatLocation } from "@/lib/format";
import { isDeadlineSoon } from "@/lib/deadline";
import { cn } from "@/lib/utils";

export function OpportunityCard({
  opportunity,
  saved = false,
  match,
  className,
}: {
  opportunity: Opportunity;
  saved?: boolean;
  match?: { score: number; reasons: string[] };
  className?: string;
}) {
  const orgName = opportunity.organization?.name ?? "Unknown Organization";
  const deadlineSoon = isDeadlineSoon(opportunity.deadline, opportunity.rollingDeadline);

  return (
    <Card className={cn("group/opp-card relative gap-3 p-4 transition-shadow hover:shadow-md", className)}>
      <Link href={`/opportunities/${opportunity.slug}`} className="absolute inset-0 z-0" tabIndex={-1} aria-hidden="true" />
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <OrgAvatar name={orgName} size="md" />
          <div className="min-w-0">
            <h3 className="truncate text-[15px] leading-snug font-semibold text-foreground group-hover/opp-card:text-primary">
              <Link href={`/opportunities/${opportunity.slug}`} className="relative z-10 focus:outline-none">
                <span className="absolute inset-0" />
                {opportunity.title}
              </Link>
            </h3>
            <p className="truncate text-sm text-muted-foreground">{orgName}</p>
          </div>
        </div>
        <div className="relative z-10 flex shrink-0 items-center gap-1">
          <SaveButton opportunityId={opportunity.id} initialSaved={saved} />
        </div>
      </div>

      {match && (
        <div className="relative z-10 -mt-1">
          <MatchBadge score={match.score} reasons={match.reasons} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">
          {opportunity.category}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          {formatLocation(opportunity)}
        </span>
        <span className="flex items-center gap-1">
          <GraduationCap className="size-3.5" />
          {formatGrades(opportunity.eligibleGrades, opportunity.gradSeniorsEligible)}
        </span>
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{opportunity.shortDescription}</p>

      {opportunity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {opportunity.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {opportunity.featured && (
            <Badge className="gap-1 bg-accent text-accent-foreground">
              <Sparkles className="size-3" />
              Featured
            </Badge>
          )}
          {deadlineSoon && !opportunity.featured && (
            <Badge variant="outline" className="border-destructive/30 text-destructive">
              Deadline Soon
            </Badge>
          )}
          <DeadlineBadge deadline={opportunity.deadline} rollingDeadline={opportunity.rollingDeadline} />
        </div>
        <span className="text-sm font-medium text-foreground">{formatCost(opportunity.cost)}</span>
      </div>
    </Card>
  );
}
