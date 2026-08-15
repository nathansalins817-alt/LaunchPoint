export const CATEGORIES = [
  "Internship",
  "Research",
  "Summer Program",
  "Scholarship",
  "Competition",
  "Hackathon",
  "Volunteering",
  "Entrepreneurship",
  "Fellowship",
  "Academic Program",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const FIELDS = [
  "Computer Science",
  "Artificial Intelligence",
  "Engineering",
  "Medicine",
  "Biology",
  "Business",
  "Finance",
  "Economics",
  "Law",
  "Government",
  "Environmental Science",
  "Journalism",
  "Writing",
  "Art",
  "Music",
  "Film",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Social Sciences",
] as const;
export type Field = (typeof FIELDS)[number];

export const GRADES = [8, 9, 10, 11, 12] as const;
export type Grade = (typeof GRADES)[number];

export const FORMATS = ["remote", "in-person", "hybrid"] as const;
export type Format = (typeof FORMATS)[number];

export const US_STATES = [
  "California",
  "New York",
  "Massachusetts",
  "Washington D.C.",
  "Texas",
] as const;

export const VERIFICATION_STATUSES = ["verified", "needs_review", "expired"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const SAVED_STATUSES = [
  "Interested",
  "Applying",
  "Applied",
  "Accepted",
  "Not Pursuing",
] as const;
export type SavedStatus = (typeof SAVED_STATUSES)[number];

export const OPPORTUNITY_STATUSES = ["published", "pending", "expired", "rejected", "draft"] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const ORGANIZATION_TYPES = [
  "University",
  "Government Agency",
  "Company",
  "Nonprofit",
  "Research Institution",
  "Foundation",
] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export interface Organization {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string | null;
  website: string;
  organizationType: OrganizationType;
}

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  organizationId: string;
  organization?: Organization;
  shortDescription: string;
  description: string;
  category: Category;
  fields: Field[];
  format: Format;
  city: string | null;
  state: string | null;
  country: string;
  remote: boolean;
  eligibleGrades: Grade[];
  gradSeniorsEligible: boolean;
  minAge: number | null;
  maxAge: number | null;
  citizenshipRequirement: string | null;
  eligibilityDescription: string;
  deadline: string | null;
  rollingDeadline: boolean;
  applicationOpenDate: string | null;
  decisionDate: string | null;
  programStartDate: string | null;
  programEndDate: string | null;
  cost: number | null;
  paid: boolean;
  stipendAmount: number | null;
  financialAid: boolean;
  activities: string[];
  applicationUrl: string;
  websiteUrl: string;
  faqUrl: string | null;
  tags: string[];
  featured: boolean;
  status: OpportunityStatus;
  isSampleData: boolean;
  lastVerifiedAt: string | null;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Interest {
  id: string;
  name: Field;
  slug: string;
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  grade: Grade | null;
  location: string | null;
  interests: string[];
  opportunityInterests: Category[];
  locationPreference: "remote" | "near-me" | "anywhere" | null;
  costPreference: "free-only" | "financial-aid" | "any" | null;
  onboardingCompleted: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export interface SavedOpportunity {
  userId: string;
  opportunityId: string;
  opportunity?: Opportunity;
  status: SavedStatus;
  savedAt: string;
}

export interface OpportunitySubmission {
  id: string;
  opportunityName: string;
  organizationName: string;
  websiteUrl: string;
  applicationUrl: string;
  description: string;
  category: Category;
  deadline: string | null;
  eligibleGrades: Grade[];
  location: string;
  cost: string;
  contactEmail: string;
  additionalNotes: string | null;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export const REPORT_REASONS = [
  "Deadline incorrect",
  "Program discontinued",
  "Eligibility incorrect",
  "Broken link",
  "Other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export interface OpportunityReport {
  id: string;
  opportunityId: string;
  reason: ReportReason;
  details: string | null;
  reporterEmail: string | null;
  status: "open" | "resolved" | "dismissed";
  createdAt: string;
}

// --- Discovery pipeline (sections 38-53) ---

export const SOURCE_TYPES = [
  "university",
  "company",
  "government",
  "nonprofit",
  "research_institution",
  "scholarship_org",
  "competition",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export interface DiscoverySource {
  id: string;
  organizationName: string;
  sourceUrl: string;
  sourceType: SourceType;
  active: boolean;
  checkFrequency: "daily" | "weekly" | "monthly";
  lastCheckedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface DiscoveryRun {
  id: string;
  sourceId: string;
  startedAt: string;
  completedAt: string | null;
  status: "running" | "completed" | "failed";
  opportunitiesFound: number;
  errors: string | null;
}

export interface ExtractionConfidence {
  title: number;
  deadline: number;
  eligibility: number;
  cost: number;
  overall: number;
}

export interface ExtractedOpportunityData {
  title: string | null;
  organization: string | null;
  category: Category | null;
  description: string | null;
  shortDescription: string | null;
  deadline: string | null;
  applicationOpenDate: string | null;
  programStartDate: string | null;
  programEndDate: string | null;
  grades: number[];
  minAge: number | null;
  maxAge: number | null;
  location: string | null;
  state: string | null;
  country: string | null;
  format: Format | null;
  cost: number | null;
  paid: boolean | null;
  stipendAmount: number | null;
  financialAid: boolean | null;
  applicationUrl: string | null;
  websiteUrl: string | null;
  citizenshipRequirement: string | null;
  eligibilityNotes: string | null;
  confidence: ExtractionConfidence;
}

export type DiscoveryReviewStatus =
  | "new"
  | "needs_review"
  | "possible_duplicate"
  | "approved"
  | "rejected"
  | "saved_for_later";

export interface DiscoveredOpportunity {
  id: string;
  sourceId: string;
  source?: DiscoverySource;
  rawTitle: string;
  rawContent: string;
  extractedData: ExtractedOpportunityData;
  confidenceScore: number;
  duplicateOfId: string | null;
  reviewStatus: DiscoveryReviewStatus;
  discoveredAt: string;
  lastCheckedAt: string;
}

export type ChangeReviewStatus = "pending" | "accepted" | "ignored";

export interface OpportunityChange {
  id: string;
  opportunityId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  sourceUrl: string;
  detectedAt: string;
  reviewStatus: ChangeReviewStatus;
}
