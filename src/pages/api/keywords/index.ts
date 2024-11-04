import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getAuthenticatedUserId } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {

    try {

      const userId = await getAuthenticatedUserId(req, res);

      // Fetch distinct keywords for the given user
      const keywords = await prisma.keyword.findMany({
        where: {
          userId: userId,
        },
        select: {
          id: true,
          name: true,
        },
        distinct: ['name'],
      });

      res.status(200).json(keywords);
    } catch (error) {
      console.error('Error fetching keywords:', error);
      res.status(500).json({ error: 'Error fetching keywords' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
