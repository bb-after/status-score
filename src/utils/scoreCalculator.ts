/**
 * Centralized reputation score calculation utility
 * This is the SINGLE SOURCE OF TRUTH for all score calculations
 */

export type EntityType = "individual" | "company" | "public-figure";

export interface ReputationMetrics {
  positiveArticles: number;
  wikipediaPresence: number;
  ownedAssets: number;
  negativeLinks: number;
  socialPresence: number;
  geoPresence: number;
  totalResults?: number; // Total number of search results for percentage calculation
}

export interface ScoreBreakdown {
  positiveArticlesScore: number;
  wikipediaScore: number;
  ownedAssetsScore: number;
  negativeLinksScore: number; // This will be negative
  socialPresenceScore: number;
  geoPresenceScore: number;
  totalScore: number;
}

/**
 * Calculate owned assets score with consistent logic
 */
export function calculateOwnedAssetsScore(
  count: number,
  maxPoints: number,
): number {
  if (count >= 5) return maxPoints; // Perfect score
  if (count >= 3) return maxPoints * 0.8; // Great score (80%)
  if (count >= 1) return maxPoints * 0.5; // OK score (50%)
  return 0; // No owned assets = 0 points
}

/**
 * Main score calculation function - THE authoritative source
 */
export function calculateReputationScore(
  metrics: ReputationMetrics,
  entityType: EntityType,
): ScoreBreakdown {
  let positiveArticlesScore = 0;
  let wikipediaScore = 0;
  let ownedAssetsScore = 0;
  let negativeLinksScore = 0;
  let socialPresenceScore = 0;
  let geoPresenceScore = 0;

  // Calculate positive articles score as percentage-based
  const calculatePositiveScore = (
    positiveCount: number,
    totalResults: number,
    maxPoints: number,
  ): number => {
    if (totalResults === 0) return 0;
    const percentage = positiveCount / totalResults;
    return Math.min(percentage * maxPoints, maxPoints);
  };

  // Use totalResults if available, otherwise fall back to old logic for backward compatibility
  const totalResults =
    metrics.totalResults ||
    Math.max(metrics.positiveArticles + metrics.negativeLinks, 10);

  // Entity-specific scoring weights (positive articles = 70%, other factors = 30%)
  if (entityType === "public-figure") {
    positiveArticlesScore = calculatePositiveScore(
      metrics.positiveArticles,
      totalResults,
      70,
    );
    wikipediaScore = (metrics.wikipediaPresence / 5) * 10;
    ownedAssetsScore = calculateOwnedAssetsScore(metrics.ownedAssets, 10);
    negativeLinksScore = -metrics.negativeLinks * 10;
    socialPresenceScore = (metrics.socialPresence / 100) * 5;
    geoPresenceScore = (metrics.geoPresence / 100) * 5;
  } else if (entityType === "company") {
    positiveArticlesScore = calculatePositiveScore(
      metrics.positiveArticles,
      totalResults,
      70,
    );
    wikipediaScore = (metrics.wikipediaPresence / 5) * 10;
    ownedAssetsScore = calculateOwnedAssetsScore(metrics.ownedAssets, 10);
    negativeLinksScore = -metrics.negativeLinks * 10;
    socialPresenceScore = (metrics.socialPresence / 100) * 5;
    geoPresenceScore = (metrics.geoPresence / 100) * 5;
  } else {
    // individual
    positiveArticlesScore = calculatePositiveScore(
      metrics.positiveArticles,
      totalResults,
      70,
    );
    wikipediaScore = 0; // Individuals typically don't have Wikipedia pages
    ownedAssetsScore = calculateOwnedAssetsScore(metrics.ownedAssets, 15);
    negativeLinksScore = -metrics.negativeLinks * 10;
    socialPresenceScore = (metrics.socialPresence / 100) * 10;
    geoPresenceScore = (metrics.geoPresence / 100) * 5;
  }

  const totalScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        positiveArticlesScore +
          wikipediaScore +
          ownedAssetsScore +
          negativeLinksScore +
          socialPresenceScore +
          geoPresenceScore,
      ),
    ),
  );

  return {
    positiveArticlesScore: Math.round(positiveArticlesScore * 100) / 100,
    wikipediaScore: Math.round(wikipediaScore * 100) / 100,
    ownedAssetsScore: Math.round(ownedAssetsScore * 100) / 100,
    negativeLinksScore: Math.round(negativeLinksScore * 100) / 100,
    socialPresenceScore: Math.round(socialPresenceScore * 100) / 100,
    geoPresenceScore: Math.round(geoPresenceScore * 100) / 100,
    totalScore,
  };
}

/**
 * Quick score calculation - just returns the total
 */
export function calculateScore(
  metrics: ReputationMetrics,
  entityType: EntityType,
): number {
  return calculateReputationScore(metrics, entityType).totalScore;
}

/**
 * Legacy support for old data structure
 */
export interface LegacyReputationData {
  positiveArticles: number;
  wikipediaPresence: number;
  ownedAssets: number;
  negativeLinks: number;
  socialPresence: number;
  aiOverviews?: number; // Optional for backward compatibility - ignored in calculation
  geoPresence?: number; // Optional for backward compatibility
  totalResults?: number; // Optional for backward compatibility
}

export function calculateScoreFromLegacyData(
  data: LegacyReputationData,
  entityType: EntityType,
): number {
  const metrics: ReputationMetrics = {
    positiveArticles: data.positiveArticles,
    wikipediaPresence: data.wikipediaPresence,
    ownedAssets: data.ownedAssets,
    negativeLinks: data.negativeLinks,
    socialPresence: data.socialPresence,
    geoPresence: data.geoPresence || 0,
    totalResults: data.totalResults,
  };

  return calculateScore(metrics, entityType);
}
