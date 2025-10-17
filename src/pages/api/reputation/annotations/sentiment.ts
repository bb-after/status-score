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

    const { url, sentiment, reason, keyword } = req.body;

    if (!url || !sentiment || !reason || !keyword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['positive', 'neutral', 'negative'].includes(sentiment)) {
      return res.status(400).json({ error: 'Invalid sentiment value' });
    }

    // Find the user by Auth0 ID
    const user = await prisma.user.findFirst({
      where: { remoteAuth0ID: session.user.sub },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert sentiment to enum value
    const sentimentEnum = sentiment.toUpperCase() as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

    // Check if annotation already exists
    const existingAnnotation = await prisma.resultAnnotation.findUnique({
      where: {
        userId_url_annotationType: {
          userId: user.id,
          url,
          annotationType: 'SENTIMENT',
        },
      },
      include: {
        sentimentData: true,
      },
    });

    let annotation;
    
    if (existingAnnotation) {
      // Update existing annotation and its sentiment data
      if (existingAnnotation.sentimentData) {
        // Update sentiment data
        await prisma.sentimentAnnotation.update({
          where: {
            id: existingAnnotation.sentimentData.id,
          },
          data: {
            sentiment: sentimentEnum,
            reason,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create sentiment data for existing annotation
        await prisma.sentimentAnnotation.create({
          data: {
            annotationId: existingAnnotation.id,
            sentiment: sentimentEnum,
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
          sentimentData: true,
        },
      });
    } else {
      // Create new annotation with sentiment data
      annotation = await prisma.resultAnnotation.create({
        data: {
          userId: user.id,
          url,
          keyword,
          annotationType: 'SENTIMENT',
          sentimentData: {
            create: {
              sentiment: sentimentEnum,
              reason,
            },
          },
        },
        include: {
          sentimentData: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      annotation,
      message: 'Sentiment annotation saved successfully',
    });

  } catch (error) {
    console.error('Error saving sentiment annotation:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to save sentiment annotation' 
    });
  }
}