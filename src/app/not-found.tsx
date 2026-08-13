import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Compass className="size-6" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist, or the opportunity may no longer be listed.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/discover">Explore Opportunities</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
