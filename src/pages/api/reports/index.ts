import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { keywordId } = req.query;

    if (!keywordId) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    try {
      // Fetch reports related to the given keyword
      const reports = await prisma.report.findMany({
        where: {
          keyword: {
            id: Number(keywordId),
          },
        },
        orderBy: {
          createdAt: 'asc', // Order by creation time
        },
      });

      res.status(200).json(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Error fetching reports' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
