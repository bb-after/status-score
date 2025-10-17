import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      searches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages,
      },
    });

  } catch (error) {
    console.error('Error fetching reputation search history:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch search history' 
    });
  }
}