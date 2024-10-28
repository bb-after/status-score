import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const auth0UserId = session.user.sub;
    const user = await prisma.user.findFirst({
      where: {
        remoteAuth0ID: auth0UserId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user.id;

    // Fetch teams associated with this user
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    // Serialize Date fields to strings
    const serializedTeams = teams.map(team => ({
      ...team,
      createdAt: team.createdAt instanceof Date ? team.createdAt.toISOString() : team.createdAt,
      updatedAt: team.updatedAt instanceof Date ? team.updatedAt.toISOString() : team.updatedAt,
      members: team.members.map(member => ({
        ...member,
        createdAt: member.createdAt instanceof Date ? member.createdAt.toISOString() : member.createdAt,
        user: {
          ...member.user,
          createdAt: member.user.createdAt instanceof Date ? member.user.createdAt.toISOString() : member.user.createdAt,
        },
      })),
    }));

    res.status(200).json(serializedTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
