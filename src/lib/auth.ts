// lib/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from './prisma';
import { getSession } from '@auth0/nextjs-auth0';

export async function getAuthenticatedUserId(req: NextApiRequest, res: NextApiResponse) {
  // Step 1: Verify that the requester is authenticated
  const session = await getSession(req, res);
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const auth0UserId = session.user.sub;

  // Step 2: Get the authenticated user's ID from your system
  const user = await prisma.user.findFirst({
    where: {
      remoteAuth0ID: auth0UserId,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.id;
}
