// pages/api/reports/[userId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const reports = await prisma.report.findMany({
      where: {
        userId: parseInt(userId as string),
      },
      include: {
        keyword: true,  // Optionally include related keyword data
      },
    });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reports' });
  }
}
