export type DeadlineTone = "green" | "yellow" | "orange" | "red" | "gray" | "none";

export interface DeadlineInfo {
  tone: DeadlineTone;
  label: string;
  daysLeft: number | null;
}

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Deadline urgency labels are derived from the current date on every render,
 * never stored, so they stay accurate without a background job.
 */
export function getDeadlineInfo(deadline: string | null, rollingDeadline: boolean, now: Date = new Date()): DeadlineInfo {
  if (rollingDeadline) {
    return { tone: "none", label: "Rolling deadline", daysLeft: null };
  }
  if (!deadline) {
    return { tone: "none", label: "No deadline listed", daysLeft: null };
  }

  const deadlineDate = new Date(`${deadline}T23:59:59`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / DAY_MS);

  if (daysLeft < 0) {
    return { tone: "gray", label: "Deadline passed", daysLeft };
  }
  if (daysLeft === 0) {
    return { tone: "red", label: "Closes today", daysLeft };
  }
  if (daysLeft === 1) {
    return { tone: "red", label: "Closes tomorrow", daysLeft };
  }
  if (daysLeft <= 7) {
    return { tone: "red", label: `${daysLeft} days left`, daysLeft };
  }
  if (daysLeft <= 21) {
    return { tone: "orange", label: `${daysLeft} days left`, daysLeft };
  }
  if (daysLeft <= 45) {
    return { tone: "yellow", label: `${daysLeft} days left`, daysLeft };
  }
  const monthsLeft = Math.round(daysLeft / 30);
  return { tone: "green", label: `${monthsLeft} month${monthsLeft === 1 ? "" : "s"} left`, daysLeft };
}

export const DEADLINE_TONE_CLASSES: Record<DeadlineTone, string> = {
  green: "bg-success/10 text-success border-success/20",
  yellow: "bg-warning/10 text-warning border-warning/20 dark:text-warning",
  orange: "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400",
  red: "bg-destructive/10 text-destructive border-destructive/20",
  gray: "bg-muted text-muted-foreground border-border",
  none: "bg-muted text-muted-foreground border-border",
};

export function isDeadlineSoon(deadline: string | null, rollingDeadline: boolean, now: Date = new Date()): boolean {
  const info = getDeadlineInfo(deadline, rollingDeadline, now);
  return info.daysLeft !== null && info.daysLeft >= 0 && info.daysLeft <= 21;
}

export function isExpired(deadline: string | null, rollingDeadline: boolean, now: Date = new Date()): boolean {
  if (rollingDeadline || !deadline) return false;
  return getDeadlineInfo(deadline, rollingDeadline, now).daysLeft! < 0;
}
