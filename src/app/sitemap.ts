import type { MetadataRoute } from "next";
import { getAllPublishedOpportunities, getOrganizations } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [opportunities, organizations] = await Promise.all([getAllPublishedOpportunities(), getOrganizations()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/discover`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/categories`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/deadlines`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/submit`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const opportunityRoutes: MetadataRoute.Sitemap = opportunities.map((o) => ({
    url: `${siteUrl}/opportunities/${o.slug}`,
    lastModified: o.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const organizationRoutes: MetadataRoute.Sitemap = organizations.map((o) => ({
    url: `${siteUrl}/organizations/${o.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...opportunityRoutes, ...organizationRoutes];
}
