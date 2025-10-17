import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';
import { performRealReputationAnalysis, SearchResult, ReputationData, AnalysisResult } from '../../../utils/reputationAnalyzer';

// Mock data generator for demonstration
const generateMockResults = (keyword: string, type: 'individual' | 'company' | 'public-figure'): SearchResult[] => {
  const sources = ['Wikipedia', 'LinkedIn', 'Twitter', 'Facebook', 'News Site', 'Blog', 'Company Website', 'Review Site'];
  const sentiments: ('positive' | 'neutral' | 'negative')[] = ['positive', 'neutral', 'negative'];
  
  // Public figures and companies tend to have more search results and potentially more negative content
  const negativeWeight = type === 'public-figure' ? 0.4 : type === 'company' ? 0.35 : 0.25;
  
  return Array.from({ length: 20 }, (_, index) => {
    const randomValue = Math.random();
    let sentiment: 'positive' | 'neutral' | 'negative';
    
    if (randomValue < negativeWeight) {
      sentiment = 'negative';
    } else if (randomValue < negativeWeight + 0.3) {
      sentiment = 'neutral';
    } else {
      sentiment = 'positive';
    }
    
    return {
      url: `https://example.com/${keyword.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
      title: `${keyword} - ${sources[Math.floor(Math.random() * sources.length)]} Result ${index + 1}`,
      snippet: `This is a sample snippet about ${keyword} that would normally contain relevant information from the search result. The content would be analyzed for sentiment and relevance.`,
      sentiment,
      source: sources[Math.floor(Math.random() * sources.length)],
      rank: index + 1
    };
  });
};

const analyzeReputation = async (keyword: string, type: 'individual' | 'company' | 'public-figure'): Promise<AnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const results = generateMockResults(keyword, type);
  
  // Calculate metrics based on mock results
  const positiveCount = results.filter(r => r.sentiment === 'positive').length;
  const negativeCount = results.filter(r => r.sentiment === 'negative').length;
  const wikipediaResults = results.filter(r => r.source === 'Wikipedia').length;
  const socialResults = results.filter(r => ['Twitter', 'Facebook', 'LinkedIn'].includes(r.source)).length;
  
  // Wikipedia presence logic
  let wikipediaPresence = 0;
  if (type === 'individual') {
    wikipediaPresence = 0;
  } else if (type === 'public-figure') {
    const baseWikipediaPresence = Math.min(5, wikipediaResults * 2 + Math.floor(Math.random() * 4));
    wikipediaPresence = Math.random() > 0.3 ? baseWikipediaPresence : Math.floor(Math.random() * 2);
  } else {
    const baseWikipediaPresence = Math.min(5, wikipediaResults * 2 + Math.floor(Math.random() * 3));
    wikipediaPresence = Math.random() > 0.5 ? baseWikipediaPresence : Math.floor(Math.random() * 2);
  }

  // GEO (Generative Engine Optimization) presence logic
  const baseGeoPresence = type === 'company' 
    ? Math.floor(Math.random() * 40) + 50
    : type === 'public-figure'
    ? Math.floor(Math.random() * 50) + 30
    : Math.floor(Math.random() * 60) + 20;
  
  const data: ReputationData = {
    positiveArticles: positiveCount,
    wikipediaPresence,
    ownedAssets: Math.floor(Math.random() * 40) + (type === 'individual' ? 50 : 40),
    negativeLinks: negativeCount,
    socialPresence: Math.floor(Math.random() * 30) + (type === 'public-figure' ? 70 : 60),
    aiOverviews: Math.floor(Math.random() * 4) + 1,
    geoPresence: baseGeoPresence
  };
  
  // Calculate score with type-specific weighting
  let score = 0;
  
  if (type === 'public-figure') {
    score += Math.min((data.positiveArticles / 15) * 25, 25);
    score += (data.wikipediaPresence / 5) * 20;
    score += (data.ownedAssets / 100) * 15;
    score -= data.negativeLinks * 17.5;
    score += (data.socialPresence / 100) * 10;
    score += (data.aiOverviews / 5) * 5;
    score += (data.geoPresence / 100) * 5;
  } else if (type === 'company') {
    score += Math.min((data.positiveArticles / 15) * 30, 30);
    score += (data.wikipediaPresence / 5) * 15;
    score += (data.ownedAssets / 100) * 15;
    score -= data.negativeLinks * 15;
    score += (data.socialPresence / 100) * 10;
    score += (data.aiOverviews / 5) * 5;
    score += (data.geoPresence / 100) * 10;
  } else {
    score += Math.min((data.positiveArticles / 15) * 35, 35);
    score += (data.ownedAssets / 100) * 25;
    score -= data.negativeLinks * 12.5;
    score += (data.socialPresence / 100) * 15;
    score += (data.aiOverviews / 5) * 5;
    score += (data.geoPresence / 100) * 5;
  }
  
  return {
    keyword,
    entityType: type,
    score: Math.max(0, Math.min(100, Math.round(score))),
    data,
    results,
    timestamp: new Date().toISOString()
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { keyword, entityType } = req.body;
    
    if (!keyword || !entityType) {
      return res.status(400).json({ error: 'Missing keyword or entityType' });
    }

    if (!['individual', 'company', 'public-figure'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entityType' });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Perform real analysis using Google APIs, with fallback to mock data
    let analysis;
    
    try {
      analysis = await performRealReputationAnalysis(keyword, entityType);
    } catch (error) {
      console.error('Real analysis failed, falling back to mock data:', error);
      // Fallback to mock data if Google APIs fail
      analysis = await analyzeReputation(keyword, entityType);
    }

    // Save to database with original score (no pre-adjustments)
    await prisma.reputationSearch.create({
      data: {
        userId: user.id,
        keyword: analysis.keyword,
        entityType: analysis.entityType.toUpperCase() as any,
        score: analysis.score,
        positiveArticles: analysis.data.positiveArticles,
        wikipediaPresence: analysis.data.wikipediaPresence,
        ownedAssets: analysis.data.ownedAssets,
        negativeLinks: analysis.data.negativeLinks,
        socialPresence: analysis.data.socialPresence,
        aiOverviews: analysis.data.aiOverviews,
        geoPresence: analysis.data.geoPresence,
        searchResults: analysis.results as any
      }
    });

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Reputation analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}