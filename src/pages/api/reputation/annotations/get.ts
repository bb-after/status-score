import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { urls, keyword } = req.query;

    if (!urls || !keyword) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Find the user by Auth0 ID
    const user = await prisma.user.findFirst({
      where: { remoteAuth0ID: session.user.sub },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const urlList = Array.isArray(urls) ? urls : [urls];

    // Fetch all annotations for this user and these URLs
    const annotations = await prisma.resultAnnotation.findMany({
      where: {
        userId: user.id,
        url: {
          in: urlList as string[],
        },
      },
      include: {
        sentimentData: true,
        assetClaimData: true,
      },
    });

    // Group annotations by URL
    const annotationsByUrl: Record<string, any> = {};
    
    // Initialize all URLs with null values
    urlList.forEach((url: string) => {
      annotationsByUrl[url] = {
        sentiment: null,
        assetClaim: null,
      };
    });

    // Populate with actual data
    annotations.forEach((annotation) => {
      if (annotation.annotationType === 'SENTIMENT' && annotation.sentimentData) {
        annotationsByUrl[annotation.url].sentiment = {
          value: annotation.sentimentData.sentiment.toLowerCase(),
          reason: annotation.sentimentData.reason,
          updatedAt: annotation.sentimentData.updatedAt.toISOString(),
        };
      } else if (annotation.annotationType === 'ASSET_CLAIM' && annotation.assetClaimData) {
        annotationsByUrl[annotation.url].assetClaim = {
          claimType: annotation.assetClaimData.claimType.toLowerCase(),
          reason: annotation.assetClaimData.reason,
          updatedAt: annotation.assetClaimData.updatedAt.toISOString(),
        };
      }
    });

    return res.status(200).json({
      success: true,
      annotations: annotationsByUrl,
    });

  } catch (error) {
    console.error('Error fetching annotations:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch annotations' 
    });
  }
}