// pages/api/keywords/add.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { keyword, userId } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    try {
      // Test basic findMany on dataSource to ensure it works
      const dataSources = await prisma.dataSource.findMany();
      console.log('Data Sources:', dataSources); // Log to check if the model works
      
      // Create a new keyword without nesting
      const newKeyword = await prisma.keyword.create({
        data: {
          name: keyword,
          user: {
            connect: { id: userId },
          },
        },
      });

      res.status(201).json(newKeyword);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error adding keyword' + error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
