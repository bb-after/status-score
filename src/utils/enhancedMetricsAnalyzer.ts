import { SearchResult } from "./reputationAnalyzer";
import { analyzeReputationSentimentWithAI } from "./aiReputationSentiment";

export interface EnhancedMetrics {
  socialPresence: {
    score: number;
    platforms: string[];
    count: number;
    details: Array<{ platform: string; url: string; title: string }>;
  };
  geoPresence: {
    score: number;
    aiOptimizedResults: number;
    structuredDataResults: number;
    knowledgeGraphMentions: number;
  };
  wikipediaPresence: {
    score: number;
    hasWikipedia: boolean;
    authorityMentions: number;
    encyclopedicSources: number;
  };
  ownedAssets: {
    score: number;
    officialSites: number;
    verifiedProfiles: number;
    ownedDomains: Array<{ domain: string; confidence: number }>;
  };
  mediaPresence: {
    newsResults: number;
    blogResults: number;
    prResults: number;
    interviewResults: number;
  };
}

// Social media platform detection
const SOCIAL_PLATFORMS = {
  "linkedin.com": "LinkedIn",
  "twitter.com": "Twitter",
  "x.com": "Twitter",
  "facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "youtube.com": "YouTube",
  "tiktok.com": "TikTok",
  "github.com": "GitHub",
  "medium.com": "Medium",
  "substack.com": "Substack",
};

// Authority/Encyclopedia sources
const AUTHORITY_SOURCES = [
  "wikipedia.org",
  "britannica.com",
  "crunchbase.com",
  "bloomberg.com",
  "forbes.com",
  "techcrunch.com",
  "reuters.com",
  "ap.org",
  "bbc.com",
  "cnn.com",
];

// News and media sources
const NEWS_SOURCES = [
  "reuters.com",
  "ap.org",
  "bbc.com",
  "cnn.com",
  "nytimes.com",
  "wsj.com",
  "washingtonpost.com",
  "ft.com",
  "economist.com",
  "time.com",
  "newsweek.com",
];

const BUSINESS_NEWS = [
  "bloomberg.com",
  "forbes.com",
  "fortune.com",
  "businessinsider.com",
  "techcrunch.com",
  "venturebeat.com",
  "wired.com",
  "engadget.com",
];

// GEO (Generative Engine Optimization) indicators
const GEO_INDICATORS = [
  "featured snippet",
  "knowledge graph",
  "people also ask",
  "structured data",
  "rich snippet",
  "schema markup",
  "answer box",
  "overview",
  "summary",
];

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace("www.", "");
  } catch {
    return "";
  }
}

function isOwnedDomain(
  url: string,
  keyword: string,
): { isOwned: boolean; confidence: number } {
  const domain = extractDomain(url);
  const keywordWords = keyword
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length > 2);

  let confidence = 0;
  let isOwned = false;

  // Check if domain contains keyword elements
  for (const word of keywordWords) {
    if (domain.includes(word.toLowerCase())) {
      confidence += 0.4;
      isOwned = true;
    }
  }

  // Check for official indicators
  if (
    domain.includes("official") ||
    url.includes("/about") ||
    url.includes("/profile")
  ) {
    confidence += 0.3;
    isOwned = true;
  }

  // Company-specific patterns
  if (
    url.includes("/team") ||
    url.includes("/leadership") ||
    url.includes("/founder")
  ) {
    confidence += 0.2;
    isOwned = true;
  }

  return { isOwned, confidence: Math.min(1, confidence) };
}

async function analyzeGEOPresence(
  results: SearchResult[],
  keyword: string,
): Promise<number> {
  let geoScore = 0;

  for (const result of results) {
    const text = (result.title + " " + result.snippet).toLowerCase();

    // Check for GEO indicators in the content
    const geoMatches = GEO_INDICATORS.filter((indicator) =>
      text.includes(indicator),
    ).length;
    geoScore += geoMatches * 5;

    // High-authority sources get bonus points for GEO
    const domain = extractDomain(result.url);
    if (AUTHORITY_SOURCES.some((auth) => domain.includes(auth))) {
      geoScore += 10;
    }

    // Structured content patterns
    if (
      text.includes("biography") ||
      text.includes("profile of") ||
      text.includes("about " + keyword.toLowerCase())
    ) {
      geoScore += 8;
    }

    // Wikipedia and knowledge bases are prime GEO sources
    if (domain.includes("wikipedia.org")) {
      geoScore += 15;
    }
  }

  return Math.min(100, geoScore);
}

export async function analyzeEnhancedMetrics(
  results: SearchResult[],
  keyword: string,
  entityType: "individual" | "company" | "public-figure",
): Promise<EnhancedMetrics> {
  // Social Media Analysis
  const socialDetails: Array<{ platform: string; url: string; title: string }> =
    [];
  const platforms: string[] = [];

  for (const result of results) {
    const domain = extractDomain(result.url);
    for (const [socialDomain, platform] of Object.entries(SOCIAL_PLATFORMS)) {
      if (domain.includes(socialDomain)) {
        socialDetails.push({
          platform,
          url: result.url,
          title: result.title,
        });
        if (!platforms.includes(platform)) {
          platforms.push(platform);
        }
      }
    }
  }

  // Calculate social presence score
  const socialPresenceScore = Math.min(
    100,
    platforms.length * 15 + // 15 points per platform
      socialDetails.length * 5 + // 5 points per social result
      (entityType === "public-figure" ? 20 : 0), // Bonus for public figures
  );

  // Wikipedia & Authority Analysis
  let hasWikipedia = false;
  let authorityMentions = 0;
  let encyclopedicSources = 0;

  for (const result of results) {
    const domain = extractDomain(result.url);

    if (domain.includes("wikipedia.org")) {
      hasWikipedia = true;
      encyclopedicSources++;
    }

    if (AUTHORITY_SOURCES.some((auth) => domain.includes(auth))) {
      authorityMentions++;
    }
  }

  const wikipediaScore =
    entityType === "individual"
      ? 0
      : (hasWikipedia ? 3 : 0) + Math.min(2, Math.floor(authorityMentions / 2));

  // Owned Assets Analysis
  const ownedDomains: Array<{ domain: string; confidence: number }> = [];
  let officialSites = 0;
  let verifiedProfiles = 0;

  for (const result of results) {
    const ownedAnalysis = isOwnedDomain(result.url, keyword);
    if (ownedAnalysis.isOwned) {
      const domain = extractDomain(result.url);
      ownedDomains.push({ domain, confidence: ownedAnalysis.confidence });

      if (ownedAnalysis.confidence > 0.6) {
        officialSites++;
      }

      // Check for verified/official profiles
      const text =
        result.title.toLowerCase() + " " + result.snippet.toLowerCase();
      if (text.includes("verified") || text.includes("official")) {
        verifiedProfiles++;
      }
    }
  }

  // Calculate owned assets as a count (0-10) rather than percentage
  const ownedAssetsScore = Math.min(
    10,
    officialSites + verifiedProfiles + Math.min(3, ownedDomains.length),
  );

  // Media Presence Analysis
  let newsResults = 0;
  let blogResults = 0;
  let prResults = 0;
  let interviewResults = 0;

  for (const result of results) {
    const domain = extractDomain(result.url);
    const text =
      result.title.toLowerCase() + " " + result.snippet.toLowerCase();

    if (
      NEWS_SOURCES.some((news) => domain.includes(news)) ||
      BUSINESS_NEWS.some((biz) => domain.includes(biz))
    ) {
      newsResults++;
    }

    if (
      domain.includes("blog") ||
      text.includes("blog post") ||
      result.source.toLowerCase().includes("blog")
    ) {
      blogResults++;
    }

    if (
      text.includes("press release") ||
      text.includes("announces") ||
      text.includes("pr newswire")
    ) {
      prResults++;
    }

    if (
      text.includes("interview") ||
      text.includes("talks with") ||
      text.includes("speaks to")
    ) {
      interviewResults++;
    }
  }

  // GEO Presence Analysis
  const geoScore = await analyzeGEOPresence(results, keyword);
  const aiOptimizedResults = results.filter((r) => {
    const text = (r.title + " " + r.snippet).toLowerCase();
    return GEO_INDICATORS.some((indicator) => text.includes(indicator));
  }).length;

  return {
    socialPresence: {
      score: socialPresenceScore,
      platforms,
      count: socialDetails.length,
      details: socialDetails,
    },
    geoPresence: {
      score: geoScore,
      aiOptimizedResults,
      structuredDataResults: results.filter(
        (r) => r.snippet.includes("•") || r.snippet.includes("|"),
      ).length,
      knowledgeGraphMentions: results.filter(
        (r) =>
          r.title.toLowerCase().includes("biography") ||
          r.title.toLowerCase().includes("profile"),
      ).length,
    },
    wikipediaPresence: {
      score: wikipediaScore,
      hasWikipedia,
      authorityMentions,
      encyclopedicSources,
    },
    ownedAssets: {
      score: ownedAssetsScore,
      officialSites,
      verifiedProfiles,
      ownedDomains,
    },
    mediaPresence: {
      newsResults,
      blogResults,
      prResults,
      interviewResults,
    },
  };
}
