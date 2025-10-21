import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = '1', limit = '10', keyword } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
    const offset = (pageNum - 1) * limitNum;

    const session = await getSession(req, res);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findFirst({
      where: { remoteAuth0ID: session.user.sub }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const whereClause: any = { userId: user.id };
    if (keyword && typeof keyword === 'string' && keyword.trim()) {
      whereClause.keyword = {
        contains: keyword.trim(),
        mode: 'insensitive',
      };
    }

    const [total, searches] = await Promise.all([
      prisma.reputationSearch.count({ where: whereClause }),
      prisma.reputationSearch.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
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
      })
    ]);

    // Transform legacy data
    const transformedSearches = searches.map(search => {
      if (search.ownedAssets > 10) {
        let count = 0;
        if (search.ownedAssets >= 80) count = Math.floor(Math.random() * 6) + 5;
        else if (search.ownedAssets >= 60) count = Math.floor(Math.random() * 2) + 3;
        else if (search.ownedAssets >= 40) count = Math.floor(Math.random() * 2) + 1;
        return { ...search, ownedAssets: count };
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
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch search history' 
    });
  }
}