import {
  Briefcase,
  FlaskConical,
  Sun,
  GraduationCap,
  Trophy,
  HeartHandshake,
  Rocket,
  Cpu,
  LineChart,
  Palette,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "./types";

export interface CategoryMeta {
  category: Category;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Internship: {
    category: "Internship",
    label: "Internships",
    description: "Hands-on experience at companies, labs, and agencies.",
    icon: Briefcase,
  },
  Research: {
    category: "Research",
    label: "Research",
    description: "Work alongside faculty and scientists on real projects.",
    icon: FlaskConical,
  },
  "Summer Program": {
    category: "Summer Program",
    label: "Summer Programs",
    description: "Intensive pre-college programs over the summer.",
    icon: Sun,
  },
  Scholarship: {
    category: "Scholarship",
    label: "Scholarships",
    description: "Funding to help pay for school and enrichment programs.",
    icon: GraduationCap,
  },
  Competition: {
    category: "Competition",
    label: "Competitions",
    description: "Contests to test and showcase your skills.",
    icon: Trophy,
  },
  Volunteering: {
    category: "Volunteering",
    label: "Volunteering",
    description: "Give back to your community and build experience.",
    icon: HeartHandshake,
  },
  Entrepreneurship: {
    category: "Entrepreneurship",
    label: "Entrepreneurship",
    description: "Build startups, pitch ideas, and learn business skills.",
    icon: Rocket,
  },
  Fellowship: {
    category: "Fellowship",
    label: "Fellowships",
    description: "Selective, mentored programs for ambitious students.",
    icon: Cpu,
  },
  "Academic Program": {
    category: "Academic Program",
    label: "Academic Programs",
    description: "Coursework and enrichment beyond the classroom.",
    icon: LineChart,
  },
};

export interface FieldGroupMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  fields: string[];
}

// Featured homepage groupings that blend true categories with broad fields of interest.
export const FEATURED_FIELD_GROUPS: FieldGroupMeta[] = [
  {
    label: "STEM",
    description: "Science, technology, engineering, and math programs.",
    icon: FlaskConical,
    fields: ["Computer Science", "Artificial Intelligence", "Engineering", "Mathematics", "Physics", "Chemistry", "Biology"],
  },
  {
    label: "Business",
    description: "Finance, economics, and entrepreneurship opportunities.",
    icon: LineChart,
    fields: ["Business", "Finance", "Economics"],
  },
  {
    label: "Arts & Humanities",
    description: "Writing, art, music, film, and social sciences.",
    icon: Palette,
    fields: ["Art", "Music", "Film", "Writing", "Journalism", "Social Sciences"],
  },
];

export const COST_FILTERS = [
  { key: "free", label: "Free" },
  { key: "paid", label: "Paid opportunity" },
  { key: "under-500", label: "Under $500" },
  { key: "500-2000", label: "$500–$2,000" },
  { key: "2000-plus", label: "$2,000+" },
  { key: "financial-aid", label: "Financial aid available" },
] as const;
export type CostFilterKey = (typeof COST_FILTERS)[number]["key"];

export const FORMAT_FILTERS = [
  { key: "in-person", label: "In Person" },
  { key: "remote", label: "Remote" },
  { key: "hybrid", label: "Hybrid" },
] as const;

export const DEADLINE_FILTERS = [
  { key: "this-week", label: "This week" },
  { key: "this-month", label: "This month" },
  { key: "next-3-months", label: "Next 3 months" },
  { key: "rolling", label: "Rolling deadline" },
] as const;
export type DeadlineFilterKey = (typeof DEADLINE_FILTERS)[number]["key"];

export const LOCATION_FILTERS = [
  "Remote",
  "California",
  "New York",
  "Massachusetts",
  "Washington D.C.",
  "Texas",
  "Other U.S.",
  "International",
] as const;

export const GRADE_FILTERS = ["8", "9", "10", "11", "12", "Graduating senior"] as const;

export interface InterestGroupMeta {
  label: string;
  icon: LucideIcon;
  fields: string[];
}

// Broad interest categories shown during onboarding. Each expands to the
// granular Field values (see lib/types.ts FIELDS) used for match scoring
// and stored in user_interests, so onboarding stays simple while matching
// stays precise.
export const ONBOARDING_INTERESTS: InterestGroupMeta[] = [
  { label: "Technology", icon: Cpu, fields: ["Computer Science", "Artificial Intelligence"] },
  { label: "Medicine", icon: HeartHandshake, fields: ["Medicine", "Biology"] },
  { label: "Business", icon: LineChart, fields: ["Business", "Finance", "Economics"] },
  { label: "Engineering", icon: Rocket, fields: ["Engineering"] },
  { label: "Science", icon: FlaskConical, fields: ["Physics", "Chemistry", "Mathematics"] },
  { label: "Arts", icon: Palette, fields: ["Art", "Music", "Film"] },
  { label: "Government", icon: Briefcase, fields: ["Government", "Law", "Social Sciences"] },
  { label: "Writing", icon: GraduationCap, fields: ["Writing", "Journalism"] },
  { label: "Environment", icon: Sun, fields: ["Environmental Science"] },
];

export const ONBOARDING_OPPORTUNITY_TYPES: Category[] = [
  "Internship",
  "Research",
  "Summer Program",
  "Scholarship",
  "Competition",
  "Volunteering",
];

export const NAV_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/categories", label: "Categories" },
  { href: "/deadlines", label: "Deadlines" },
  { href: "/saved", label: "Saved" },
  { href: "/about", label: "About" },
] as const;

export const SORT_OPTIONS = [
  { key: "recommended", label: "Recommended" },
  { key: "deadline", label: "Deadline Soonest" },
  { key: "recent", label: "Recently Added" },
  { key: "popular", label: "Most Popular" },
  { key: "az", label: "A–Z" },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]["key"];
