import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function CategoryCard({
  href,
  label,
  description,
  icon: Icon,
  count,
}: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  count: number;
}) {
  return (
    <Link href={href} className="group/cat block h-full">
      <Card className="h-full gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Icon className="size-5" />
          </span>
          <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover/cat:opacity-100" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{label}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        <p className="text-sm font-medium text-primary">
          {count} opportunit{count === 1 ? "y" : "ies"}
        </p>
      </Card>
    </Link>
  );
}
