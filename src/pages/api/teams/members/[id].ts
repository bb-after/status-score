// pages/api/teams/members/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const memberId = Number(req.query.id);

  if (req.method === 'PATCH') {
    const { role } = req.body;

    if (!role || !["STANDARD", "ADMIN"].includes(role)) {
      return res.status(400).json({ error: 'Invalid role provided.' });
    }

    try {
      // Step 1: Verify that the requester is authenticated
      const session = await getSession(req, res);
      if (!session || !session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const auth0UserId = session.user.sub;

      // Step 2: Get the authenticated user's ID from your system
      const authenticatedUser = await prisma.user.findFirst({
        where: {
          remoteAuth0ID: auth0UserId,
        },
      });

      if (!authenticatedUser) {
        return res.status(404).json({ error: 'Authenticated user not found' });
      }

      // Step 3: Ensure that the authenticated user is an admin of the team
      const teamMember = await prisma.teamUser.findUnique({
        where: { id: memberId },
        include: { team: { include: { members: true } } },
      });

      if (!teamMember) {
        return res.status(404).json({ error: 'Team member not found' });
      }

      const isAdmin = await prisma.teamUser.findFirst({
        where: {
          userId: authenticatedUser.id,
          teamId: teamMember.teamId,
          role: 'ADMIN',
        },
      });

      console.log('whooops', authenticatedUser.id);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only team admins can update roles' });
      }

      // Step 4: Update the team member's role
      const updatedMember = await prisma.teamUser.update({
        where: { id: memberId },
        data: { role },
      });

      res.status(200).json(updatedMember);
    } catch (error) {
      console.error('Error updating team member role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Step 1: Verify that the requester is authenticated
      const session = await getSession(req, res);
      if (!session || !session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const auth0UserId = session.user.sub;

      // Step 2: Get the authenticated user's ID from your system
      const authenticatedUser = await prisma.user.findFirst({
        where: {
          remoteAuth0ID: auth0UserId,
        },
      });

      if (!authenticatedUser) {
        return res.status(404).json({ error: 'Authenticated user not found' });
      }

      // Step 3: Ensure that the authenticated user is an admin of the team
      const teamMember = await prisma.teamUser.findUnique({
        where: { id: memberId },
        include: { team: { include: { members: true } } },
      });

      if (!teamMember) {
        return res.status(404).json({ error: 'Team member not found' });
      }

      const isAdmin = await prisma.teamUser.findFirst({
        where: {
          userId: authenticatedUser.id,
          teamId: teamMember.teamId,
          role: 'ADMIN',
        },
      });

      if (!isAdmin) {
        return res.status(403).json({ error: 'Only team admins can remove members' });
      }

      // Step 4: Delete the team member
      await prisma.teamUser.delete({
        where: { id: memberId },
      });

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting team member:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
