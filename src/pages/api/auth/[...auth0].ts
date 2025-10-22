import auth0Instance from '../../../../lib/auth0';
import prisma from '../../../lib/prisma';

export default auth0Instance.handleAuth({
  callback: auth0Instance.handleCallback({
    afterCallback: async (req, res, session) => {
      try {
        const { user } = session;

        if (user) {
          console.log("Processing user:", user.email);
          // Extract the avatar URL if the user chose to use a social source
          const avatarUrl = user.picture ?? null;

          // Upsert the user into your database after authentication
          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name ?? undefined,
              remoteAuth0ID: user.sub,
              avatar: avatarUrl, // Update avatar URL
            },
            create: {
              email: user.email,
              name: user.name ?? '', // Optional default value
              remoteAuth0ID: user.sub,
              avatar: avatarUrl, // Update avatar URL
            },
          });
        }

        // Return the session as expected
        return session;
      } catch (error) {
        console.error("Error during callback:", error);
        // Don't throw here, just log and continue
        return session;
      }
    },
  }),
});
