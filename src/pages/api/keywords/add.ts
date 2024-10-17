import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Invalid input: keyword is required' });
    }

    try {
      // Hardcoded userId for now (change this to your authenticated user's ID when ready)
      const userId = 1;

      // Step 1: Check if the keyword already exists for the user
      const existingKeyword = await prisma.keyword.findFirst({
        where: {
          name: keyword,
          userId: userId,
        },
      });

      let keywordRecord;
      if (existingKeyword) {
        // If the keyword already exists, use the existing record
        keywordRecord = existingKeyword;
      } else {
        // Otherwise, create a new keyword record
        keywordRecord = await prisma.keyword.create({
          data: {
            name: keyword,
            user: { connect: { id: userId } },
          },
        });
      }

      // Send back the created or existing keyword
      res.status(201).json(keywordRecord);

    } catch (error) {
      console.error('Error adding keyword:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
