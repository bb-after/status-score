import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { keyword, positiveArticles, negativeLinks, score } = req.body;

    if (!keyword || positiveArticles === undefined || negativeLinks === undefined || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the user by Auth0 ID
    const user = await prisma.user.findFirst({
      where: { remoteAuth0ID: session.user.sub },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the most recent reputation search for this user and keyword
    const updatedSearch = await prisma.reputationSearch.updateMany({
      where: {
        userId: user.id,
        keyword: keyword,
      },
      data: {
        positiveArticles,
        negativeLinks,
        score,
        updatedAt: new Date(),
      },
    });

    if (updatedSearch.count === 0) {
      return res.status(404).json({ error: 'No reputation search found to update' });
    }

    return res.status(200).json({
      success: true,
      message: 'Score updated successfully',
      updated: updatedSearch.count,
    });

  } catch (error) {
    console.error('Error updating reputation score:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update reputation score' 
    });
  }
}