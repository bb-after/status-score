// pages/api/reports/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { keywordId } = req.query;

    if (!keywordId) {
      return res.status(400).json({ error: 'keywordId is required' });
    }

    try {
      const reports = await prisma.report.findMany({
        where: { keywordId: Number(keywordId) },
        include: {
          dataSourceResults: {
            include: {
              dataSource: true, // Include the DataSource relation to get the data source name
            },
          },
        },
        orderBy: { createdAt: 'desc' }, // Order by date descending for most recent results first
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
