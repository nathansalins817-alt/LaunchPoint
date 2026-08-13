"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SearchBar({
  size = "default",
  placeholder = "Search internships, scholarships, research programs...",
  defaultValue = "",
  className,
}: {
  size?: "default" | "lg";
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = React.useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/discover${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn(
        "flex w-full items-center gap-2 rounded-xl border bg-card shadow-sm transition-shadow focus-within:shadow-md",
        size === "lg" ? "p-2 pl-4" : "p-1 pl-3",
        className
      )}
    >
      <Search className={cn("shrink-0 text-muted-foreground", size === "lg" ? "size-5" : "size-4")} />
      <label htmlFor="site-search" className="sr-only">
        Search opportunities
      </label>
      <Input
        id="site-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "border-0 shadow-none focus-visible:ring-0 dark:bg-transparent",
          size === "lg" && "h-auto text-base md:text-[15px]"
        )}
      />
      <Button type="submit" size={size === "lg" ? "lg" : "default"} className="shrink-0">
        Search
      </Button>
    </form>
  );
}
