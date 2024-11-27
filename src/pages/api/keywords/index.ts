import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getAuthenticatedUserId } from '../../../lib/auth';
import { Prisma } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Retrieve the authenticated user ID
      const userId = await getAuthenticatedUserId(req, res);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User ID is required' });
      }

      // Fetch keywords for the authenticated user, excluding soft-deleted ones, including report count
      const keywords = await prisma.keyword.findMany({
        where: {
          userId: userId,
          deletedAt: null, // Exclude soft-deleted records
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          _count: {
            select: {
              reports: true,
            },
          },
        },
      });

      if (!keywords || keywords.length === 0) {
        return res.status(200).json([]); // Return empty array if no keywords found
      }

      // Format the response
      const formattedKeywords = keywords.map((keyword) => ({
        id: keyword.id,
        name: keyword.name,
        createdAt: keyword.createdAt.toISOString(), // Ensure consistent date format
        reportCount: keyword._count.reports,
      }));

      return res.status(200).json(formattedKeywords);
    } catch (error) {
      console.error('Error fetching keywords:', error);

      // Check for Prisma-related errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(500).json({ error: 'Database error: Unable to fetch keywords' });
      }

      // Generic error fallback
      return res.status(500).json({
        error: 'An unexpected error occurred while fetching keywords. Please try again later.',
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
