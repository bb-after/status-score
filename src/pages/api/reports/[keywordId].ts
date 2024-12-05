import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getAuthenticatedUserId } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { keywordId } = req.query;

  if (!keywordId || Array.isArray(keywordId) || isNaN(parseInt(keywordId))) {
    return res.status(400).json({ error: 'Invalid or missing keywordId' });
  }

  const keywordIdNumber = parseInt(keywordId);

  // Retrieve the authenticated user ID
  const userId = await getAuthenticatedUserId(req, res);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User ID is required' });
  }

  try {
    // First, check if the keyword belongs to the authenticated user
    const keyword = await prisma.keyword.findFirst({
      where: {
        id: keywordIdNumber,
        userId: userId,
      },
    });

    if (!keyword) {
      return res.status(404).json({ error: 'Keyword not found or unauthorized' });
    }

    // If the keyword belongs to the user, fetch the reports
    const reports = await prisma.report.findMany({
      where: {
        keywordId: keywordIdNumber,
      },
      include: {
        keyword: true,
        dataSourceResults: {
          include: {
            dataSource: {
              select: {
                name: true,
              },
            },
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Error fetching reports' });
  }
}

