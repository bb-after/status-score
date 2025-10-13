import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    console.log('....', session);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      keyword, 
      analysisType, 
      intentCategory, 
      customPrompt 
    } = req.body;
    
    if (!keyword || !analysisType || !intentCategory) {
      return res.status(400).json({ 
        error: 'Missing required fields: keyword, analysisType, or intentCategory' 
      });
    }

    if (!['brand', 'individual'].includes(analysisType)) {
      return res.status(400).json({ error: 'Invalid analysisType' });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get environment variables
    const apiKey = process.env.EXTERNAL_API_GEO_KEY;
    const serviceUrl = process.env.EXTERNAL_GEO_SERVICE_URL;

    if (!apiKey) {
      console.error('EXTERNAL_API_GEO_KEY environment variable not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!serviceUrl) {
      console.error('EXTERNAL_GEO_SERVICE_URL environment variable not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Call external GEO service
    const response = await fetch(`${serviceUrl}/api/external/geo-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        keyword: keyword.trim(),
        externalUserId: session.user.sub || 'anonymous',
        externalUserName: session.user.name || session.user.email || 'Anonymous User',
        applicationName: 'Status Score - Reputation Management',
        analysisType,
        intentCategory,
        customPrompt: customPrompt || undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External GEO service error:', response.status, errorText);
      return res.status(502).json({ 
        error: 'External service unavailable',
        details: `Service returned ${response.status}`
      });
    }

    const result = await response.json();

    // Save results to database
    console.log('=== ATTEMPTING TO SAVE GEO ANALYSIS ===');
    console.log('User ID:', user.id);
    console.log('Keyword:', keyword.trim());
    console.log('Analysis Type:', analysisType);
    console.log('Intent Category:', intentCategory);
    console.log('Results array length:', result.results?.length || 0);
    console.log('Has aggregated insights:', !!result.aggregatedInsights);
    
    // Test if the table exists by trying to count records
    console.log('Available Prisma models:', Object.keys(prisma));
    
    try {
      // Try both camelCase and PascalCase
      const count = prisma.geoSearch ? await prisma.geoSearch.count() : 'geoSearch not found';
      console.log('geoSearch count:', count);
    } catch (countError) {
      console.error('❌ geoSearch error:', countError);
    }
    
    try {
      const savedRecord = await prisma.geoSearch.create({
        data: {
          userId: user.id,
          keyword: keyword.trim(),
          analysisType: analysisType as 'brand' | 'individual',
          intentCategory,
          customPrompt: customPrompt || null,
          analysisId: result.analysisId || null,
          overallSentiment: result.aggregatedInsights?.overallSentiment || null,
          results: result.results || [],
          aggregatedInsights: result.aggregatedInsights || null,
          metadata: result.metadata || null,
        }
      });
      console.log('✅ GEO analysis saved successfully with ID:', savedRecord.id);
    } catch (dbError) {
      console.error('❌ Failed to save GEO analysis to database:', dbError);
      console.error('Error name:', dbError?.name);
      console.error('Error message:', dbError?.message);
      console.error('Error code:', dbError?.code);
      console.error('Full error:', dbError);
      // Don't fail the request if database save fails - just log it
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('GEO analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}