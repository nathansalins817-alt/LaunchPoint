import { BadgeCheck, AlertTriangle, CircleSlash } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { VerificationStatus } from "@/lib/types";

const META: Record<VerificationStatus, { label: string; icon: typeof BadgeCheck; className: string }> = {
  verified: { label: "Verified", icon: BadgeCheck, className: "text-success" },
  needs_review: { label: "Needs Review", icon: AlertTriangle, className: "text-warning" },
  expired: { label: "Expired", icon: CircleSlash, className: "text-muted-foreground" },
};

export function VerificationBadge({
  status,
  lastVerifiedAt,
  className,
}: {
  status: VerificationStatus;
  lastVerifiedAt: string | null;
  className?: string;
}) {
  const meta = META[status];
  const Icon = meta.icon;
  return (
    <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <Icon className={cn("size-3.5", meta.className)} />
      <span className={cn("font-medium", meta.className)}>{meta.label}</span>
      <span aria-hidden="true">·</span>
      <span>{lastVerifiedAt ? `Last verified: ${formatDate(lastVerifiedAt)}` : "Not yet verified"}</span>
    </div>
  );
}
