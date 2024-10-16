import prisma from '../../../lib/prisma';
import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';

export default handleAuth({
  async callback(req, res) {
    try {
      // Calling handleCallback returns an object containing `user` and other tokens
      const result: any = await handleCallback(req, res);
      const user = result?.user;      

      if (user && user.email) {
        // Store user in the database
        await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            name: user.name,
          },
        });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error during callback handling:', error);
      res.status(error.status || 500).end(error.message);
    }
  },
});
