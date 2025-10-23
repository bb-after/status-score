/**
 * Reputation search configuration utilities
 */

export type EntityType = "individual" | "company" | "public-figure";

/**
 * Get the maximum number of search results for a given entity type
 */
export function getResultLimit(entityType: EntityType): number {
  const defaults = {
    individual: 10,
    company: 15,
    "public-figure": 20,
  };

  const envKey = `REPUTATION_RESULTS_${entityType.toUpperCase().replace("-", "_")}`;
  const envValue = process.env[envKey];

  return envValue ? parseInt(envValue, 10) : defaults[entityType];
}

/**
 * Get the minimum threshold below which we should alert users about low result count
 */
export function getMinResultThreshold(): number {
  const defaultThreshold = 5;
  const envValue = process.env.REPUTATION_RESULTS_MIN_THRESHOLD;

  return envValue ? parseInt(envValue, 10) : defaultThreshold;
}

/**
 * Check if result count is below threshold and generate appropriate message
 */
export function getLowResultAlert(
  entityType: EntityType,
  actualCount: number,
): {
  isLowCount: boolean;
  message?: string;
  suggestions?: string[];
} {
  const threshold = getMinResultThreshold();
  const maxResults = getResultLimit(entityType);

  if (actualCount >= threshold) {
    return { isLowCount: false };
  }

  const entityLabel =
    entityType === "public-figure" ? "public figure" : entityType;

  return {
    isLowCount: true,
    message: `Only ${actualCount} results found for your ${entityLabel} search. This limits our analysis accuracy.`,
    suggestions: [
      "Consider creating more online content (articles, press releases, social media)",
      "Optimize existing content for search engines",
      "Build professional profiles on relevant platforms",
      entityType === "company"
        ? "Increase PR and content marketing efforts"
        : "Enhance your online presence and visibility",
      "Monitor and improve your digital footprint across multiple platforms",
    ],
  };
}
