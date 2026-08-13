import "server-only";
import { cache } from "react";
import { organizations, opportunities } from "./seed-data";
import type {
  Opportunity,
  Organization,
  Category,
  OrganizationType,
  OpportunityStatus,
  VerificationStatus,
} from "../types";
import type { OpportunityFilters } from "./filters";
import type { SortKey } from "../constants";
import { applyFilters, sortOpportunities } from "./query";
import { isSupabaseConfigured } from "../supabase/env";
import { createClient } from "../supabase/server";
import type { Database } from "../supabase/database.types";

export { applyFilters, sortOpportunities };

/**
 * Repository layer. Every Server Component/route reads opportunity data
 * through the functions in this file rather than importing seed-data or
 * Supabase directly.
 *
 * Each function has two implementations, picked at request time by
 * `isSupabaseConfigured`:
 *  - Supabase configured: queries the live `organizations`/`opportunities`
 *    tables (and their join tables) and maps rows onto the domain types in
 *    lib/types.ts.
 *  - Not configured: serves the bootstrapped demo catalog in seed-data.ts,
 *    so the public site works with zero setup.
 *
 * This file must stay server-only - it's the one place allowed to import
 * lib/supabase/server. Client Components that need the pure filter/sort
 * logic should import lib/data/query.ts directly instead of this file.
 */

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"];
type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const orgById = new Map(organizations.map((o) => [o.id, o]));

function withOrganization(o: Opportunity): Opportunity {
  return { ...o, organization: orgById.get(o.organizationId) };
}

const demoPublished = opportunities.filter((o) => o.status === "published").map(withOrganization);

// ---------------------------------------------------------------------------
// Supabase row -> domain type mapping
// ---------------------------------------------------------------------------

function mapOrganizationRow(row: OrganizationRow): Organization {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    logoUrl: row.logo_url,
    website: row.website,
    organizationType: row.organization_type as OrganizationType,
  };
}

function mapOpportunityRow(
  row: OpportunityRow,
  organization: Organization | undefined,
  grades: number[],
  fields: string[]
): Opportunity {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    organizationId: row.organization_id,
    organization,
    shortDescription: row.short_description,
    description: row.description,
    category: row.category as Category,
    fields: fields as Opportunity["fields"],
    format: row.format as Opportunity["format"],
    city: row.city,
    state: row.state,
    country: row.country,
    remote: row.remote,
    eligibleGrades: grades as Opportunity["eligibleGrades"],
    gradSeniorsEligible: row.grad_seniors_eligible,
    minAge: row.min_age,
    maxAge: row.max_age,
    citizenshipRequirement: row.citizenship_requirement,
    eligibilityDescription: row.eligibility_description,
    deadline: row.deadline,
    rollingDeadline: row.rolling_deadline,
    applicationOpenDate: row.application_open_date,
    decisionDate: row.decision_date,
    programStartDate: row.program_start_date,
    programEndDate: row.program_end_date,
    cost: row.cost,
    paid: row.paid,
    stipendAmount: row.stipend_amount,
    financialAid: row.financial_aid,
    activities: row.activities,
    applicationUrl: row.application_url,
    websiteUrl: row.website_url,
    faqUrl: row.faq_url,
    tags: row.tags,
    featured: row.featured,
    status: row.status as OpportunityStatus,
    isSampleData: row.is_sample_data,
    lastVerifiedAt: row.last_verified_at,
    verificationStatus: row.verification_status as VerificationStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Batch-loads organizations, grades, and fields for a set of opportunity
 * rows and assembles full Opportunity objects - one round trip per related
 * table, regardless of how many opportunities are being hydrated. */
async function hydrateOpportunities(supabase: SupabaseClient, rows: OpportunityRow[]): Promise<Opportunity[]> {
  if (rows.length === 0) return [];

  const orgIds = [...new Set(rows.map((r) => r.organization_id))];
  const oppIds = rows.map((r) => r.id);

  const [{ data: orgRows }, { data: gradeRows }, { data: interestLinkRows }] = await Promise.all([
    supabase.from("organizations").select("*").in("id", orgIds),
    supabase.from("opportunity_grades").select("*").in("opportunity_id", oppIds),
    supabase.from("opportunity_interests").select("*").in("opportunity_id", oppIds),
  ]);

  const organizationById = new Map((orgRows ?? []).map((o) => [o.id, mapOrganizationRow(o)]));

  const gradesByOpportunity = new Map<string, number[]>();
  for (const g of gradeRows ?? []) {
    gradesByOpportunity.set(g.opportunity_id, [...(gradesByOpportunity.get(g.opportunity_id) ?? []), g.grade]);
  }

  const interestIds = [...new Set((interestLinkRows ?? []).map((r) => r.interest_id))];
  const interestNameById = new Map<string, string>();
  if (interestIds.length > 0) {
    const { data: interestRows } = await supabase.from("interests").select("*").in("id", interestIds);
    for (const i of interestRows ?? []) interestNameById.set(i.id, i.name);
  }

  const fieldsByOpportunity = new Map<string, string[]>();
  for (const link of interestLinkRows ?? []) {
    const name = interestNameById.get(link.interest_id);
    if (!name) continue;
    fieldsByOpportunity.set(link.opportunity_id, [...(fieldsByOpportunity.get(link.opportunity_id) ?? []), name]);
  }

  return rows.map((row) =>
    mapOpportunityRow(
      row,
      organizationById.get(row.organization_id),
      gradesByOpportunity.get(row.id) ?? [],
      fieldsByOpportunity.get(row.id) ?? []
    )
  );
}

// ---------------------------------------------------------------------------
// Public repository functions
// ---------------------------------------------------------------------------

export const getOrganizations = cache(async (): Promise<Organization[]> => {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.from("organizations").select("*").order("name", { ascending: true });
    return (data ?? []).map(mapOrganizationRow);
  }
  return organizations;
});

export const getOrganizationBySlug = cache(async (slug: string): Promise<Organization | undefined> => {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.from("organizations").select("*").eq("slug", slug).maybeSingle();
    return data ? mapOrganizationRow(data) : undefined;
  }
  return organizations.find((o) => o.slug === slug);
});

export async function getOpportunitiesByOrganizationSlug(slug: string): Promise<Opportunity[]> {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: org } = await supabase.from("organizations").select("id").eq("slug", slug).maybeSingle();
    if (!org) return [];
    const { data } = await supabase
      .from("opportunities")
      .select("*")
      .eq("organization_id", org.id)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    return hydrateOpportunities(supabase, data ?? []);
  }

  const org = organizations.find((o) => o.slug === slug);
  if (!org) return [];
  return demoPublished.filter((o) => o.organizationId === org.id);
}

export const getOpportunityBySlug = cache(async (slug: string): Promise<Opportunity | undefined> => {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.from("opportunities").select("*").eq("slug", slug).maybeSingle();
    if (!data) return undefined;
    const [hydrated] = await hydrateOpportunities(supabase, [data]);
    return hydrated;
  }
  return opportunities.map(withOrganization).find((o) => o.slug === slug);
});

export async function getFeaturedOpportunities(limit = 6): Promise<Opportunity[]> {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("opportunities")
      .select("*")
      .eq("status", "published")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return hydrateOpportunities(supabase, data ?? []);
  }
  return demoPublished.filter((o) => o.featured).slice(0, limit);
}

export const getAllPublishedOpportunities = cache(async (): Promise<Opportunity[]> => {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("opportunities")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    return hydrateOpportunities(supabase, data ?? []);
  }
  return demoPublished;
});

export interface PlatformStats {
  opportunityCount: number;
  fieldCount: number;
  stateCount: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const published = await getAllPublishedOpportunities();
  const fields = new Set<string>();
  const states = new Set<string>();
  for (const o of published) {
    o.fields.forEach((f) => fields.add(f));
    if (o.state) states.add(o.state);
  }
  return {
    opportunityCount: published.length,
    fieldCount: fields.size,
    stateCount: states.size,
  };
}

export async function getCategoryCounts(): Promise<Record<Category, number>> {
  const published = await getAllPublishedOpportunities();
  const counts = {} as Record<Category, number>;
  for (const o of published) {
    counts[o.category] = (counts[o.category] ?? 0) + 1;
  }
  return counts;
}

export async function getFieldCounts(): Promise<Record<string, number>> {
  const published = await getAllPublishedOpportunities();
  const counts: Record<string, number> = {};
  for (const o of published) {
    for (const f of o.fields) {
      counts[f] = (counts[f] ?? 0) + 1;
    }
  }
  return counts;
}

export async function listOpportunities(filters: OpportunityFilters = {}, sort: SortKey = "recommended"): Promise<Opportunity[]> {
  const published = await getAllPublishedOpportunities();
  return sortOpportunities(applyFilters(published, filters), sort);
}
