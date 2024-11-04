// pages/api/teams/invite.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';
import { sendEmail } from '../../../lib/sendgrid'; // Example, if you have this util function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { teamId, userEmail } = req.body;

    if (!teamId || !userEmail) {
      return res.status(400).json({ error: 'Team ID and user email are required' });
    }

    try {
      // Step 1: Verify that the requester is authenticated
      const session = await getSession(req, res);
      if (!session || !session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const auth0UserId = session.user.sub;

      // Step 2: Get the authenticated user's ID from your system
      const inviterUser = await prisma.user.findFirst({
        where: {
          remoteAuth0ID: auth0UserId,
        },
      });

      if (!inviterUser) {
        return res.status(404).json({ error: 'Inviter not found' });
      }

      const inviterUserId = inviterUser.id;

      // Step 3: Ensure that the inviter is an admin for the given team
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

      // Step 4: Check if the user to be invited already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (existingUser) {
        // Add existing user to the team
        const teamUser = await prisma.teamUser.create({
          data: {
            userId: existingUser.id,
            teamId: teamId,
            role: 'MEMBER', // default role for a new team member
          },
        });

        // Optionally, you can send an email notifying that they have been added
        await sendEmail(
          userEmail,
          'You’ve been added to a team!',
          `You have been added to the team ${inviter.team.name}. You can access it by logging in.`,
          `<strong>You have been added to the team ${inviter.team.name}.</strong> You can access it by logging in.`
        );

        return res.status(201).json(teamUser);
      } else {
        // Create a new invite for a user who doesn't exist yet
        const teamInvite = await prisma.teamInvite.create({
          data: {
            email: userEmail,
            teamId: teamId,
            role: 'MEMBER', // default role for invited member
          },
        });

        // Send invitation email
        await sendEmail(
          userEmail,
          'You’ve been invited to join a team!',
          `You have been invited to join the team ${inviter.team.name}. Please click the link below to register and accept your invitation.`,
          `<strong>You have been invited to join the team ${inviter.team.name}</strong>. Please click the link below to register and accept your invitation.`
        );

        return res.status(201).json({ message: 'Invitation created successfully', teamInvite });
      }
    } catch (error) {
      console.error('Error inviting user to team:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
