import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import { getUserSubscriptionStatusByEmail } from "../../../utils/subscription";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getSession(req, res);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const subscriptionStatus = await getUserSubscriptionStatusByEmail(
      session.user.email,
    );

    return res.status(200).json(subscriptionStatus);
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to check subscription status",
    });
  }
}
