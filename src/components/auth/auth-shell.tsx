import Link from "next/link";
import { Compass } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <Link href="/" className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Compass className="size-5" strokeWidth={2.25} />
      </Link>
      <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-1.5 text-center text-sm text-muted-foreground">{description}</p>

      <div className="mt-8 rounded-xl border bg-card p-6 shadow-sm">{children}</div>
    </div>
  );
}
