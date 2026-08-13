import { Check } from "lucide-react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Stage {
  label: string;
  date: string | null;
}

export function OpportunityTimeline({
  applicationOpenDate,
  deadline,
  rollingDeadline,
  decisionDate,
  programStartDate,
  programEndDate,
}: {
  applicationOpenDate: string | null;
  deadline: string | null;
  rollingDeadline: boolean;
  decisionDate: string | null;
  programStartDate: string | null;
  programEndDate: string | null;
}) {
  const now = new Date();
  const stages: Stage[] = [
    { label: "Applications Open", date: applicationOpenDate },
    { label: "Application Deadline", date: rollingDeadline ? null : deadline },
    { label: "Decision Date", date: decisionDate },
    { label: "Program Begins", date: programStartDate },
    { label: "Program Ends", date: programEndDate },
  ].filter((s) => s.date !== null || (s.label === "Application Deadline" && rollingDeadline));

  if (stages.length === 0) return null;

  return (
    <ol className="relative ml-3 space-y-6 border-l-2 border-border pl-6">
      {stages.map((stage) => {
        const isPast = stage.date ? new Date(`${stage.date}T00:00:00`) < now : false;
        const label = stage.label === "Application Deadline" && rollingDeadline ? "Rolling — apply anytime" : formatDate(stage.date);
        return (
          <li key={stage.label} className="relative">
            <span
              className={cn(
                "absolute top-0.5 -left-[1.9rem] flex size-4 items-center justify-center rounded-full border-2",
                isPast ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
              )}
            >
              {isPast && <Check className="size-2.5" strokeWidth={3} />}
            </span>
            <p className="text-sm font-medium text-foreground">{stage.label}</p>
            <p className="text-sm text-muted-foreground">{label ?? "Not yet announced"}</p>
          </li>
        );
      })}
    </ol>
  );
}
