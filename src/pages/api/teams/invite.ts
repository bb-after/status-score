import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getSession } from "@auth0/nextjs-auth0";
import { v4 as uuidv4 } from "uuid";
import sendEmail from "../../../utils/sendEmail";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { teamId, userEmail, role = "MEMBER" } = req.body;

  if (!teamId || !userEmail) {
    return res
      .status(400)
      .json({ error: "Team ID and user email are required" });
  }

  try {
    // Step 1: Verify that the requester is authenticated
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const auth0UserId = session.user.sub;

    // Step 2: Get the authenticated user's ID from your system
    const inviterUser = await prisma.user.findFirst({
      where: {
        remoteAuth0ID: auth0UserId,
      },
    });

    if (!inviterUser) {
      return res.status(404).json({ error: "Inviter not found" });
    }

    const inviterUserId = inviterUser.id;

    // Step 3: Ensure that the inviter is an admin for the given team
    const inviter = await prisma.teamUser.findFirst({
      where: {
        userId: inviterUserId,
        teamId: teamId,
        role: "ADMIN",
      },
    });

    if (!inviter) {
      return res
        .status(403)
        .json({ error: "Only team admins can invite users" });
    }

    // Step 4: Fetch the team details to get the name
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Step 5: Check if the user to be invited already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (existingUser) {
      // Step 6: If the user already exists, check if they are already in the team
      const existingTeamUser = await prisma.teamUser.findFirst({
        where: {
          userId: existingUser.id,
          teamId: teamId,
        },
      });

      if (existingTeamUser) {
        return res
          .status(409)
          .json({ error: "User is already a member of the team" });
      }

      // Add existing user to the team
      const teamUser = await prisma.teamUser.create({
        data: {
          userId: existingUser.id,
          teamId: teamId,
          role: role,
        },
      });

      // Send email notification
      await sendEmail({
        to: userEmail,
        subject: "You’ve been added to a team!",
        text: `You have been added to the team ${team.name}. You can access it by logging in.`,
        html: `<strong>You have been added to the team ${team.name}.</strong> You can access it by logging in.`,
      });

      return res
        .status(201)
        .json({ message: "User added to team successfully", teamUser });
    } else {
      // Step 7: If the user does not exist, create an invite
      const token = uuidv4();
      const teamInvite = await prisma.teamInvite.create({
        data: {
          email: userEmail,
          teamId: teamId,
          token,
          status: "PENDING",
        },
      });

      // Send invitation email
      await sendEmail({
        to: userEmail,
        subject: "You’ve been invited to join a team!",
        text: `You have been invited to join the team ${team.name}. Please click the link below to register and accept your invitation.`,
        html: `<strong>You have been invited to join the team ${team.name}</strong>. Please click the link below to register and accept your invitation.`,
      });

      return res
        .status(201)
        .json({ message: "Invitation created successfully", teamInvite });
    }
  } catch (error: any) {
    console.error("Error inviting user to team:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
