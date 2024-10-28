// pages/api/teams/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Get the user session
      const session = await getSession(req, res);

      if (!session || !session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userEmail = session.user.email;

      // Find the user in the database by their email
      const user = await prisma.user.findUnique({
        where: {
          email: userEmail,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Destructure the request body to get the team name
      const { teamName } = req.body;

      if (!teamName) {
        return res.status(400).json({ error: 'Team name is required' });
      }

      // Create the new team and add the current user as the ADMIN
      const newTeam = await prisma.team.create({
        data: {
          name: teamName,
          members: {
            create: {
              userId: user.id,
              role: 'ADMIN',
            },
          },
        },
      });

      // Respond with the newly created team
      res.status(201).json(newTeam);
    } catch (error) {
      console.log("ami here");
      console.error('Emrror creating team:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
