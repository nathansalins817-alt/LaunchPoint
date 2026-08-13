import Link from "next/link";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2 shrink-0", className)}>
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Compass className="size-4" strokeWidth={2.25} />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">LaunchPoint</span>
    </Link>
  );
}
