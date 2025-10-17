import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { url, claimType, reason, keyword } = req.body;

    if (!url || !claimType || !reason || !keyword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['owned', 'not_owned', 'not_relevant'].includes(claimType)) {
      return res.status(400).json({ error: 'Invalid claim type' });
    }

    // Find the user by Auth0 ID
    const user = await prisma.user.findFirst({
      where: { remoteAuth0ID: session.user.sub },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert claim type to enum value
    const claimTypeEnum = claimType.toUpperCase() as 'OWNED' | 'NOT_OWNED' | 'NOT_RELEVANT';

    // Check if annotation already exists
    const existingAnnotation = await prisma.resultAnnotation.findUnique({
      where: {
        userId_url_annotationType: {
          userId: user.id,
          url,
          annotationType: 'ASSET_CLAIM',
        },
      },
      include: {
        assetClaimData: true,
      },
    });

    let annotation;
    
    if (existingAnnotation) {
      // Update existing annotation and its asset claim data
      if (existingAnnotation.assetClaimData) {
        // Update asset claim data
        await prisma.assetClaimAnnotation.update({
          where: {
            id: existingAnnotation.assetClaimData.id,
          },
          data: {
            claimType: claimTypeEnum,
            reason,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create asset claim data for existing annotation
        await prisma.assetClaimAnnotation.create({
          data: {
            annotationId: existingAnnotation.id,
            claimType: claimTypeEnum,
            reason,
          },
        });
      }
      
      // Update annotation itself
      annotation = await prisma.resultAnnotation.update({
        where: {
          id: existingAnnotation.id,
        },
        data: {
          keyword,
          updatedAt: new Date(),
        },
        include: {
          assetClaimData: true,
        },
      });
    } else {
      // Create new annotation with asset claim data
      annotation = await prisma.resultAnnotation.create({
        data: {
          userId: user.id,
          url,
          keyword,
          annotationType: 'ASSET_CLAIM',
          assetClaimData: {
            create: {
              claimType: claimTypeEnum,
              reason,
            },
          },
        },
        include: {
          assetClaimData: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      annotation,
      message: 'Asset claim saved successfully',
    });

  } catch (error) {
    console.error('Error saving asset claim:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to save asset claim' 
    });
  }
}