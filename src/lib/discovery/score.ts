import "server-only";
import type { ExtractedCandidate } from "./extract";

export interface DiscoveryPreferences {
  interests: string[];
  opportunityTypes: string[];
  minGrade: number | null;
  maxGrade: number | null;
  formatPreference: string | null;
}

export interface DiscoveryMatch {
  score: number;
  reasons: string[];
}

const WEIGHTS = { interests: 40, type: 25, grade: 20, format: 15 };

/**
 * Deterministic, explainable relevance score against the admin's configured
 * search preferences - separate from confidence_score (how sure we are the
 * listing is real). A dimension the admin hasn't configured gets half credit
 * rather than zero, same pattern as the student-facing scorer in lib/match.ts,
 * so an empty settings page doesn't make everything look irrelevant.
 */
export function computeDiscoveryMatch(preferences: DiscoveryPreferences, candidate: ExtractedCandidate): DiscoveryMatch {
  let score = 0;
  const reasons: string[] = [];

  if (preferences.interests.length > 0) {
    const matched = candidate.interestTags.filter((t) => preferences.interests.includes(t));
    if (matched.length > 0) {
      score += WEIGHTS.interests;
      reasons.push(`Matches your interest in ${matched[0]}`);
    }
  } else {
    score += WEIGHTS.interests * 0.5;
  }

  if (preferences.opportunityTypes.length > 0) {
    if (candidate.category && preferences.opportunityTypes.includes(candidate.category)) {
      score += WEIGHTS.type;
      reasons.push(`You're looking for ${candidate.category.toLowerCase()} opportunities`);
    }
  } else {
    score += WEIGHTS.type * 0.5;
  }

  if (preferences.minGrade !== null && preferences.maxGrade !== null) {
    const overlaps = candidate.grades.some((g) => g >= preferences.minGrade! && g <= preferences.maxGrade!);
    if (candidate.grades.length === 0 || overlaps) {
      score += WEIGHTS.grade;
      if (overlaps) reasons.push("Open to your configured grade range");
    }
  } else {
    score += WEIGHTS.grade * 0.5;
  }

  if (!preferences.formatPreference || preferences.formatPreference === "any") {
    score += WEIGHTS.format * 0.5;
  } else if (!candidate.format || candidate.format === preferences.formatPreference) {
    score += WEIGHTS.format;
    if (candidate.format) reasons.push(`${candidate.format} format matches your preference`);
  }

  return { score: Math.min(100, Math.round(score)), reasons };
}
