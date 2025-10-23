import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";
import prisma from "../../../lib/prisma";
import {
  performRealReputationAnalysis,
  AnalysisResult,
} from "../../../utils/reputationAnalyzer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getSession(req, res);
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { keyword, entityType } = req.body;

    if (!keyword || !entityType) {
      return res.status(400).json({ error: "Missing keyword or entityType" });
    }

    if (!["individual", "company", "public-figure"].includes(entityType)) {
      return res.status(400).json({ error: "Invalid entityType" });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Perform real analysis using Google APIs
    const analysis = await performRealReputationAnalysis(keyword, entityType);

    // Save to database with original score (no pre-adjustments)
    await prisma.reputationSearch.create({
      data: {
        userId: user.id,
        keyword: analysis.keyword,
        entityType: analysis.entityType.toUpperCase() as any,
        score: analysis.score,
        positiveArticles: analysis.data.positiveArticles,
        wikipediaPresence: analysis.data.wikipediaPresence,
        ownedAssets: analysis.data.ownedAssets,
        negativeLinks: analysis.data.negativeLinks,
        socialPresence: analysis.data.socialPresence,
        aiOverviews: analysis.data.aiOverviews,
        geoPresence: analysis.data.geoPresence,
        searchResults: analysis.results as any,
      },
    });

    res.status(200).json(analysis);
  } catch (error) {
    console.error("Reputation analysis error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
