export function formatCost(cost: number | null): string {
  if (cost === null || cost === 0) return "Free";
  return `$${cost.toLocaleString("en-US")}`;
}

export function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatDateShort(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatLocation(opts: { city: string | null; state: string | null; country: string; remote: boolean }): string {
  if (opts.remote && !opts.city && !opts.state) return "Remote";
  const parts = [opts.city, opts.state].filter(Boolean);
  const base = parts.length > 0 ? parts.join(", ") : opts.country;
  return opts.remote ? `${base} · Remote option` : base;
}

export function formatGrades(grades: number[], gradSeniorsEligible: boolean): string {
  if (grades.length === 0) return "All grades";
  const sorted = [...grades].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = min === max ? `Grade ${min}` : `Grades ${min}–${max}`;
  return gradSeniorsEligible ? `${range} + Seniors` : range;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
