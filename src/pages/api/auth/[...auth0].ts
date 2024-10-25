import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

export default handleAuth({
  async callback(req, res) {
    try {
      await handleCallback(req, res, {
        afterCallback: async (req, res, session) => {
          const { user } = session;

          if (user) {
            // Upsert the user into your database after authentication
            await prisma.user.upsert({
              where: { email: user.email },
              update: {
                name: user.name ?? undefined,
                remoteAuth0ID: user.sub,
              },
              create: {
                email: user.email,
                name: user.name ?? '', // Optional default value
                remoteAuth0ID: user.sub,
              },
            });
          }

          // Return the session as expected
          return session;
        },
      });

      res.status(200).send("Callback handled successfully");
    } catch (error) {
      console.error("Error during callback:", error);
      res.status(error.status || 500).end(error.message);
    }
  },
});
