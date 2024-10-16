// pages/api/reports/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { aiEngine, payload, keywordId, userId, imageUrl, pdfUrl, prompt, response, sentiment } = req.body;

    if (!aiEngine || !payload || !keywordId || !userId || !prompt || !response || !sentiment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const newReport = await prisma.report.create({
        data: {
          aiEngine,
          payload,
          keywordId: parseInt(keywordId),
          userId: parseInt(userId),
          imageUrl: imageUrl || null,
          pdfUrl: pdfUrl || null,
          prompt,
          response,
          sentiment,
        },
      });

      res.status(201).json(newReport);
    } catch (error) {
      res.status(500).json({ error: 'Error creating report' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
