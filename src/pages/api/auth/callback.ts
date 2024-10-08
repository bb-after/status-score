// pages/api/auth/callback.ts
import prisma from '../../../lib/prisma';
import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';

export default handleAuth({
  async callback(req, res) {
    try {
      const { user } = await handleCallback(req, res);

      // Store user in the database
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          email: user.email,
          name: user.name,
        },
      });

      res.status(200).json(user);
    } catch (error) {
      res.status(error.status || 500).end(error.message);
    }
  }
});
