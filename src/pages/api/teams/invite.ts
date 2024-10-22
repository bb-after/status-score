// pages/api/teams/invite.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { teamId, userEmail, inviterUserId } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email: userEmail } });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const team = await prisma.team.findUnique({ where: { id: teamId } });

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      // Check if the inviter is an admin
      const inviter = await prisma.teamUser.findFirst({
        where: {
          userId: inviterUserId,
          teamId: teamId,
          role: 'ADMIN',
        },
      });

      if (!inviter) {
        return res.status(403).json({ error: 'Only team admins can invite users' });
      }

      // Add user to the team
      const teamUser = await prisma.teamUser.create({
        data: {
          userId: user.id,
          teamId: teamId,
          role: 'MEMBER',
        },
      });

      res.status(201).json(teamUser);
    } catch (error) {
      console.error('Error inviting user to team:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
