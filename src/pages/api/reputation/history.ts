import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { keyword } = req.query;
    
    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({ error: 'Missing keyword parameter' });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get historical data for the keyword
    const history = await prisma.reputationSearch.findMany({
      where: {
        userId: user.id,
        keyword: keyword
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        score: true,
        createdAt: true
      }
    });

    // Format the response
    const formattedHistory = history.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      score: item.score
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}