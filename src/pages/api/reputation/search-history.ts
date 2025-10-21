import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set proper headers to prevent caching issues
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page = 1, limit = 10, keyword } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Find user in database
    const user = await prisma.user.findFirst({
      where: { remoteAuth0ID: session.user.sub }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build where clause
    const whereClause: any = {
      userId: user.id,
    };

    // Filter by keyword if provided
    if (keyword && typeof keyword === 'string') {
      whereClause.keyword = {
        contains: keyword,
        mode: 'insensitive',
      };
    }

    // Get total count for pagination
    const total = await prisma.reputationSearch.count({
      where: whereClause,
    });

    // Get paginated search history
    const searches = await prisma.reputationSearch.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limitNum,
      select: {
        id: true,
        keyword: true,
        entityType: true,
        score: true,
        positiveArticles: true,
        wikipediaPresence: true,
        ownedAssets: true,
        negativeLinks: true,
        socialPresence: true,
        aiOverviews: true,
        geoPresence: true,
        searchResults: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Transform legacy percentage-based ownedAssets to count-based
    const transformedSearches = searches.map(search => {
      // If ownedAssets > 10, it's likely a legacy percentage value, convert to count
      if (search.ownedAssets > 10) {
        // Convert percentage to approximate count (0-10 scale)
        // 80-100% -> 5-10 assets, 60-79% -> 3-4 assets, 40-59% -> 1-2 assets, <40% -> 0 assets
        let count;
        if (search.ownedAssets >= 80) count = Math.floor(Math.random() * 6) + 5; // 5-10
        else if (search.ownedAssets >= 60) count = Math.floor(Math.random() * 2) + 3; // 3-4
        else if (search.ownedAssets >= 40) count = Math.floor(Math.random() * 2) + 1; // 1-2
        else count = 0;
        
        return {
          ...search,
          ownedAssets: count
        };
      }
      return search;
    });

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      searches: transformedSearches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages,
      },
    });

  } catch (error) {
    console.error('Error fetching reputation search history:', error);
    
    // Ensure we don't have multiple responses
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch search history' 
      });
    }
  }
}