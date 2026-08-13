import type { Metadata } from "next";
import { CategoryCard } from "@/components/category-card";
import { getCategoryCounts, getFieldCounts } from "@/lib/data";
import { CATEGORY_META, FEATURED_FIELD_GROUPS } from "@/lib/constants";
import { CATEGORIES } from "@/lib/types";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse LaunchPoint opportunities by category — internships, research, scholarships, competitions, and more.",
};

export default async function CategoriesPage() {
  const [categoryCounts, fieldCounts] = await Promise.all([getCategoryCounts(), getFieldCounts()]);

  const categoryCards = CATEGORIES.map((c) => ({ meta: CATEGORY_META[c], count: categoryCounts[c] ?? 0 }));
  const fieldGroupCards = FEATURED_FIELD_GROUPS.map((g) => ({
    group: g,
    count: g.fields.reduce((sum, f) => sum + (fieldCounts[f] ?? 0), 0),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Categories</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Every kind of opportunity on LaunchPoint, organized so you can jump straight to what you&rsquo;re looking for.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categoryCards.map(({ meta, count }) => (
          <CategoryCard
            key={meta.category}
            href={`/discover?category=${encodeURIComponent(meta.category)}`}
            label={meta.label}
            description={meta.description}
            icon={meta.icon}
            count={count}
          />
        ))}
        {fieldGroupCards.map(({ group, count }) => (
          <CategoryCard
            key={group.label}
            href={`/discover?field=${encodeURIComponent(group.fields[0])}`}
            label={group.label}
            description={group.description}
            icon={group.icon}
            count={count}
          />
        ))}
      </div>
    </div>
  );
}
