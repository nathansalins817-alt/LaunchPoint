/** Interest tags the admin can configure discovery to favor, and that
 * extracted candidates get tagged with for scoring. Deliberately a separate,
 * broader vocabulary from lib/types.ts FIELDS (which drives student-facing
 * matching) since discovery covers things like podcasting/theater that
 * aren't academic fields. */
export const DISCOVERY_INTERESTS = [
  "Technology",
  "AI",
  "Entrepreneurship",
  "Podcasting",
  "Theater",
  "Leadership",
  "Journalism",
  "Public Speaking",
  "Community Service",
  "Academics",
] as const;
export type DiscoveryInterest = (typeof DISCOVERY_INTERESTS)[number];

export const FORMAT_PREFERENCES = ["any", "remote", "in-person", "hybrid"] as const;
export type DiscoveryFormatPreference = (typeof FORMAT_PREFERENCES)[number];
