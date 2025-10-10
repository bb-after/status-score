import axios from 'axios';
import { analyzeReputationSentimentWithAI } from './aiReputationSentiment';
import { analyzeEnhancedMetrics } from './enhancedMetricsAnalyzer';

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  source: string;
  rank: number;
  score?: number;
  magnitude?: number;
}

export interface ReputationData {
  positiveArticles: number;
  wikipediaPresence: number;
  ownedAssets: number;
  negativeLinks: number;
  socialPresence: number;
  aiOverviews: number;
  geoPresence: number;
}

export interface AnalysisResult {
  keyword: string;
  entityType: 'individual' | 'company' | 'public-figure';
  score: number;
  data: ReputationData;
  results: SearchResult[];
  timestamp: string;
  enhancedMetrics?: {
    socialPresence: {
      platforms: string[];
      count: number;
      details: Array<{ platform: string; url: string; title: string; }>;
    };
    ownedAssets: {
      officialSites: number;
      verifiedProfiles: number;
      ownedDomains: Array<{ domain: string; confidence: number; }>;
    };
    mediaPresence: {
      newsResults: number;
      blogResults: number;
      prResults: number;
      interviewResults: number;
    };
  };
}

// Function to extract domain/source from URL
function extractSource(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const domainParts = domain.split('.');
    return domainParts.length > 1 ? domainParts[domainParts.length - 2] : domain;
  } catch {
    return 'Unknown';
  }
}

// Function to categorize sources
function categorizeSource(url: string, title: string): string {
  const domain = url.toLowerCase();
  const titleLower = title.toLowerCase();
  
  if (domain.includes('wikipedia.org')) return 'Wikipedia';
  if (domain.includes('linkedin.com')) return 'LinkedIn';
  if (domain.includes('twitter.com') || domain.includes('x.com')) return 'Twitter';
  if (domain.includes('facebook.com')) return 'Facebook';
  if (domain.includes('instagram.com')) return 'Instagram';
  if (domain.includes('youtube.com')) return 'YouTube';
  if (domain.includes('tiktok.com')) return 'TikTok';
  if (domain.includes('medium.com')) return 'Medium';
  if (domain.includes('github.com')) return 'GitHub';
  if (domain.includes('pinterest.com')) return 'Pinterest';
  if (domain.includes('reddit.com')) return 'Reddit';
  if (domain.includes('quora.com')) return 'Quora';
  if (titleLower.includes('news') || domain.includes('news') || 
      domain.includes('cnn.com') || domain.includes('bbc.com') || 
      domain.includes('reuters.com') || domain.includes('ap.org')) return 'News Site';
  if (domain.includes('blog') || titleLower.includes('blog')) return 'Blog';
  if (domain.includes('review') || titleLower.includes('review')) return 'Review Site';
  
  return extractSource(url);
}

// Function to check if URL likely represents owned assets
function isOwnedAsset(url: string, keyword: string): boolean {
  const domain = url.toLowerCase();
  const keywordWords = keyword.toLowerCase().split(' ').filter(word => word.length > 2);
  
  // Check if domain contains keyword elements (suggesting owned domain)
  return keywordWords.some(word => domain.includes(word)) ||
         domain.includes('official') ||
         url.includes('/about') ||
         url.includes('/profile');
}

export async function performRealReputationAnalysis(
  keyword: string, 
  entityType: 'individual' | 'company' | 'public-figure'
): Promise<AnalysisResult> {
  
  const googleApiKey = process.env.GOOGLE_NEWS_API_KEY;
  const googleCx = process.env.GOOGLE_CX;

  if (!googleApiKey || !googleCx) {
    throw new Error('Google API keys not configured. Please set GOOGLE_NEWS_API_KEY and GOOGLE_CX environment variables.');
  }

  try {
    // Perform Google Custom Search
    const searchQuery = encodeURIComponent(`${keyword} ${entityType === 'company' ? 'company business' : entityType === 'public-figure' ? 'person profile' : 'person'}`);
    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1?q=${searchQuery}&cx=${googleCx}&key=${googleApiKey}&num=10`
    );

    const searchItems = response.data.items || [];
    
    // Process search results and analyze sentiment
    const results: SearchResult[] = [];
    const sentimentAnalyses: any[] = [];

    for (let i = 0; i < searchItems.length; i++) {
      const item = searchItems[i];
      const source = categorizeSource(item.link, item.title);
      
      // Check if this is a social media platform - count as positive
      const socialPlatforms = ['LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'YouTube', 'TikTok', 'Medium', 'GitHub', 'Pinterest', 'Reddit', 'Quora'];
      const isSocialMedia = socialPlatforms.includes(source);
      
      let finalSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      let sentimentScore = 0;
      let confidence = 0.5;
      
      if (isSocialMedia) {
        // Social media results are automatically positive (represent engagement/presence)
        finalSentiment = 'positive';
        sentimentScore = 0.7;
        confidence = 0.8;
        
        results.push({
          url: item.link,
          title: item.title,
          snippet: item.snippet || '',
          sentiment: finalSentiment,
          source: source,
          rank: i + 1,
          score: sentimentScore,
          magnitude: confidence
        });
      } else {
        // Analyze sentiment using AI for non-social media results
        try {
          const sentimentResult = await analyzeReputationSentimentWithAI(
            item.snippet || item.title,
            keyword
          );
          sentimentAnalyses.push(sentimentResult);
          
          results.push({
            url: item.link,
            title: item.title,
            snippet: item.snippet || '',
            sentiment: sentimentResult.sentiment,
            source: source,
            rank: i + 1,
            score: sentimentResult.score,
            magnitude: sentimentResult.confidence
          });
        } catch (error) {
          console.error(`Error analyzing sentiment for result ${i}:`, error);
          // Fallback to neutral sentiment if analysis fails
          results.push({
            url: item.link,
            title: item.title,
            snippet: item.snippet || '',
            sentiment: 'neutral',
            source: source,
            rank: i + 1
          });
        }
      }
    }

    // Perform enhanced metrics analysis
    const enhancedMetrics = await analyzeEnhancedMetrics(results, keyword, entityType);
    
    // Calculate reputation metrics based on enhanced analysis
    const positiveArticles = results.filter(r => r.sentiment === 'positive').length;
    const negativeArticles = results.filter(r => r.sentiment === 'negative').length;

    // Use enhanced metrics for more accurate scoring
    const data: ReputationData = {
      positiveArticles,
      wikipediaPresence: enhancedMetrics.wikipediaPresence.score,
      ownedAssets: enhancedMetrics.ownedAssets.score,
      negativeLinks: negativeArticles,
      socialPresence: enhancedMetrics.socialPresence.score,
      aiOverviews: Math.min(enhancedMetrics.mediaPresence.newsResults + enhancedMetrics.mediaPresence.prResults, 5),
      geoPresence: enhancedMetrics.geoPresence.score
    };

    // Calculate final score using the same logic as before
    let score = 0;
    
    if (entityType === 'public-figure') {
      score += (data.positiveArticles / 10) * 70; // Up to 70 points (7 per positive)
      score += (data.wikipediaPresence / 5) * 15;
      score += (data.ownedAssets / 100) * 8;
      score -= data.negativeLinks * 30; // Negative content heavily penalized
      score += (data.socialPresence / 100) * 5;
      score += (data.aiOverviews / 5) * 2;
      score += 0; // GEO presence minimal for public figures
    } else if (entityType === 'company') {
      score += (data.positiveArticles / 10) * 65; // Up to 65 points (6.5 per positive)
      score += (data.wikipediaPresence / 5) * 15;
      score += (data.ownedAssets / 100) * 10;
      score -= data.negativeLinks * 25; // Business negative news is very damaging
      score += (data.socialPresence / 100) * 8;
      score += (data.aiOverviews / 5) * 2;
      score += 0; // GEO presence minimal for companies
    } else {
      score += (data.positiveArticles / 10) * 75; // Up to 75 points (7.5 per positive)
      score += (data.ownedAssets / 100) * 12;
      score -= data.negativeLinks * 20; // Personal negatives are damaging
      score += (data.socialPresence / 100) * 10;
      score += (data.aiOverviews / 5) * 3;
      score += 0; // GEO presence minimal for individuals
    }

    return {
      keyword,
      entityType,
      score: Math.max(0, Math.min(100, Math.round(score))),
      data,
      results,
      timestamp: new Date().toISOString(),
      enhancedMetrics: {
        socialPresence: {
          platforms: enhancedMetrics.socialPresence.platforms,
          count: enhancedMetrics.socialPresence.count,
          details: enhancedMetrics.socialPresence.details
        },
        ownedAssets: {
          officialSites: enhancedMetrics.ownedAssets.officialSites,
          verifiedProfiles: enhancedMetrics.ownedAssets.verifiedProfiles,
          ownedDomains: enhancedMetrics.ownedAssets.ownedDomains
        },
        mediaPresence: enhancedMetrics.mediaPresence
      }
    };

  } catch (error) {
    console.error('Error performing real reputation analysis:', error);
    throw new Error(`Failed to perform reputation analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}