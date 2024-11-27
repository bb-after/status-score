import { handleCallback, getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

export default async function callback(req, res) {
  console.log("Callback endpoint accessed");

  try {
    const session = await handleCallback(req, res, {
      afterCallback: async (req, res, session) => {
        console.log("Session after callback:", session);
        const { user } = session;

        // Extract the avatar URL if the user chose to use a social source
        const avatarUrl = user.picture ?? null;

        // Upsert user data in Prisma
        const upsertedUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? undefined,
            remoteAuth0ID: user.sub,
            avatar: avatarUrl,
          },
          create: {
            email: user.email,
            name: user.name ?? '', // Set to an empty string if name is not provided
            remoteAuth0ID: user.sub,
            avatar: avatarUrl,
          },
        });

        console.log("User upserted into database:", upsertedUser);
        return session;
      },
    });

    // Log to check if the session exists
    console.log("Setting session", session);
    const updatedSession = await getSession(req, res);
    if (!updatedSession) {
      console.error("Failed to get session after callback");
      res.status(500).end("Session retrieval failed");
    } else {
      res.status(200).json({ message: "User session successfully set" });
    }
  } catch (error) {
    console.error("Error during callback:", error);
    res.status(error.status || 500).end(error.message);
  }
}
