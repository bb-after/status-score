import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getAuthenticatedUserId } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    try {
      const userId = await getAuthenticatedUserId(req, res);

      console.log('USERID', userId);

      // Validate `id` query parameter
      if (!req.query.id) {
        return res.status(400).json({ error: 'Keyword ID is required' });
      }

      const keywordId = parseInt(req.query.id as string, 10);
      console.log('keywordID', keywordId);

      if (isNaN(keywordId)) {
        return res.status(400).json({ error: 'Invalid keyword ID' });
      }

      // Check if the keyword exists and belongs to the authenticated user
      const keyword = await prisma.keyword.findFirst({
        where: {
          id: keywordId,
          userId: userId,
          deletedAt: null, // Exclude already soft-deleted records
        },
      });

      if (!keyword) {
        return res.status(404).json({ error: 'Keyword not found or you do not have permission to delete it' });
      }

      console.log('Keyword to be soft deleted:', keyword.id);

      // Perform a soft delete by updating the `deletedAt` field
      await prisma.keyword.update({
        where: {
          id: keywordId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      console.log('Keyword soft deleted:', keyword.id);

      return res.status(200).json({ message: 'Keyword soft deleted successfully' });
    } catch (error) {
      console.error('Error soft deleting keyword:', error);
      return res.status(500).json({ error: 'Error soft deleting keyword' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
