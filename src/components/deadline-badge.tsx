import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDeadlineInfo, DEADLINE_TONE_CLASSES } from "@/lib/deadline";

export function DeadlineBadge({
  deadline,
  rollingDeadline,
  className,
}: {
  deadline: string | null;
  rollingDeadline: boolean;
  className?: string;
}) {
  const info = getDeadlineInfo(deadline, rollingDeadline);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        DEADLINE_TONE_CLASSES[info.tone],
        className
      )}
    >
      <Clock className="size-3" />
      {info.label}
    </span>
  );
}
