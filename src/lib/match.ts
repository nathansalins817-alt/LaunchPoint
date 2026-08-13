import type { Opportunity, Profile } from "./types";

export interface MatchResult {
  score: number;
  reasons: string[];
}

const WEIGHTS = {
  interests: 35,
  category: 20,
  grade: 20,
  location: 15,
  cost: 10,
};

/**
 * Deterministic, explainable match score. Every point awarded has a
 * corresponding human-readable reason so "Why this matches you" never
 * shows a number the student can't trace back to their own preferences.
 */
export function computeMatch(profile: Profile, opportunity: Opportunity): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  const matchedFields = opportunity.fields.filter((f) => profile.interests.includes(f));
  if (matchedFields.length > 0 && profile.interests.length > 0) {
    const ratio = Math.min(matchedFields.length / Math.min(profile.interests.length, 3), 1);
    score += Math.round(WEIGHTS.interests * ratio);
    matchedFields.slice(0, 2).forEach((f) => reasons.push(`Matches your interest in ${f}`));
  }

  if (profile.opportunityInterests.includes(opportunity.category)) {
    score += WEIGHTS.category;
    reasons.push(`You're looking for ${opportunity.category.toLowerCase()} opportunities`);
  }

  if (profile.grade !== null) {
    const gradeMatch =
      opportunity.eligibleGrades.includes(profile.grade) ||
      (profile.grade === 12 && opportunity.gradSeniorsEligible);
    if (gradeMatch) {
      score += WEIGHTS.grade;
      reasons.push(`Open to Grade ${profile.grade} students`);
    }
  } else {
    score += WEIGHTS.grade * 0.5;
  }

  if (profile.locationPreference === "remote" && opportunity.remote) {
    score += WEIGHTS.location;
    reasons.push("Remote opportunity");
  } else if (profile.locationPreference === "anywhere") {
    score += WEIGHTS.location;
  } else if (profile.locationPreference === "near-me" && profile.location && opportunity.state === profile.location) {
    score += WEIGHTS.location;
    reasons.push(`Located near you in ${opportunity.state}`);
  } else if (!profile.locationPreference) {
    score += WEIGHTS.location * 0.5;
  }

  const isFree = opportunity.cost === null || opportunity.cost === 0;
  if (profile.costPreference === "free-only" && isFree) {
    score += WEIGHTS.cost;
    reasons.push("Free program");
  } else if (profile.costPreference === "financial-aid" && (isFree || opportunity.financialAid)) {
    score += WEIGHTS.cost;
    reasons.push("Financial aid available");
  } else if (profile.costPreference === "any") {
    score += WEIGHTS.cost;
  } else if (!profile.costPreference) {
    score += WEIGHTS.cost * 0.5;
  }

  return { score: Math.min(100, Math.round(score)), reasons };
}

export function sortByMatch(profile: Profile, opportunities: Opportunity[]): (Opportunity & { match: MatchResult })[] {
  return opportunities
    .map((o) => ({ ...o, match: computeMatch(profile, o) }))
    .sort((a, b) => b.match.score - a.match.score);
}
