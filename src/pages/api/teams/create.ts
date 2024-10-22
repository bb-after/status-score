// pages/api/teams/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { teamName, userId } = req.body;

    if (!teamName || !userId) {
      return res.status(400).json({ error: 'Team name and userId are required' });
    }

    try {
      const newTeam = await prisma.team.create({
        data: {
          name: teamName,
          members: {
            create: {
              userId,
              role: 'ADMIN',
            },
          },
        },
      });

      res.status(201).json(newTeam);
    } catch (error) {
      console.error('Error creating team:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
