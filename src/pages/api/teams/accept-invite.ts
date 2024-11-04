// pages/api/teams/accept-invite.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    try {
      const invite = await prisma.teamInvite.findUnique({
        where: { token },
      });

      if (!invite || invite.status !== 'PENDING') {
        return res.status(400).json({ error: 'Invalid or expired invite' });
      }

      if (invite.userId == null) {
        return res.status(400).json({ error: 'Invalid userId passed through' });
      }
      
      // Update invite status to ACCEPTED and add user to the team
      await prisma.teamInvite.update({
        where: { token },
        data: {
          status: 'ACCEPTED',
          // user: {
          //   connect: { id: invite.userId },
          // },
        },
      });

      res.status(200).json({ message: 'Invitation accepted successfully' });
    } catch (error) {
      console.error('Error accepting team invite:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
