import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get user email from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing authorization header' });
      return;
    }

    const userEmail = authHeader.replace('Bearer ', '');
    if (!userEmail || !userEmail.includes('@')) {
      res.status(401).json({ error: 'Invalid user email' });
      return;
    }

    const { page = '1', limit = '10', keyword } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Find user by email (no Auth0 session needed)
    const user = await prisma.user.findFirst({
      where: { email: userEmail }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Use raw SQL to completely bypass Prisma's ORM layer
    let countQuery = 'SELECT COUNT(*) as count FROM ReputationSearch WHERE userId = ?';
    let searchQuery = `SELECT id, keyword, entityType, score, positiveArticles, wikipediaPresence, ownedAssets, negativeLinks, socialPresence, aiOverviews, geoPresence, searchResults, createdAt, updatedAt FROM ReputationSearch WHERE userId = ?`;
    
    const queryParams: any[] = [user.id];
    
    if (keyword && typeof keyword === 'string' && keyword.trim()) {
      countQuery += ' AND keyword LIKE ?';
      searchQuery += ' AND keyword LIKE ?';
      queryParams.push(`%${keyword.trim()}%`);
    }

    searchQuery += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    const searchParams: any[] = [...queryParams, limitNum, offset];

    const [countResult, searches] = await Promise.all([
      prisma.$queryRawUnsafe(countQuery, ...queryParams),
      prisma.$queryRawUnsafe(searchQuery, ...searchParams)
    ]);

    const total = Number((countResult as any)[0].count);

    // Transform legacy owned assets data and parse JSON fields
    const transformedSearches = (searches as any[]).map(search => {
      // Handle JSON fields - they might already be parsed or be strings
      let searchResults = [];
      if (search.searchResults) {
        try {
          searchResults = typeof search.searchResults === 'string' 
            ? JSON.parse(search.searchResults) 
            : search.searchResults;
        } catch (e) {
          console.error('Failed to parse searchResults:', e);
          searchResults = [];
        }
      }

      const parsedSearch = {
        ...search,
        searchResults
      };

      if (parsedSearch.ownedAssets > 10) {
        let count = 0;
        if (parsedSearch.ownedAssets >= 80) count = Math.floor(Math.random() * 6) + 5;
        else if (parsedSearch.ownedAssets >= 60) count = Math.floor(Math.random() * 2) + 3;
        else if (parsedSearch.ownedAssets >= 40) count = Math.floor(Math.random() * 2) + 1;
        return { ...parsedSearch, ownedAssets: count };
      }
      return parsedSearch;
    });

    res.status(200).json({
      searches: transformedSearches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });

  } catch (error) {
    console.error('Client searches API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch search history' 
    });
  }
}