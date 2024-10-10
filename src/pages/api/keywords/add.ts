import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getGeminiSentiment } from '../../../utils/gemini';
import { getOpenAISentiment } from '../../../utils/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { keyword, aiEngine } = req.body;

    if (!keyword || !aiEngine) {
      return res.status(400).json({ error: 'Invalid input: keyword and aiEngine are required' });
    }

    try {
      // Hardcoded user ID for now
      const userId = 1;

      // Step 1: Store the Keyword in the Database
      const newKeyword = await prisma.keyword.create({
        data: {
          name: keyword,
          user: { connect: { id: userId } },
        },
      });

      // Step 2: Fetch the AI Engine Result based on user selection
      let aiResult;
      if (aiEngine === 'Gemini') {
        aiResult = await getGeminiSentiment(keyword);
      } else if (aiEngine === 'OpenAI') {
        aiResult = await getOpenAISentiment(keyword);
      } else {
        return res.status(400).json({ error: 'Invalid AI Engine selected' });
      }

      // Step 3: Store the AI Engine Result in the Database as a Report
      const newReport = await prisma.report.create({
        data: {
          aiEngine,
          payload: aiResult,
          keyword: { connect: { id: newKeyword.id } },
          user: { connect: { id: userId } },
        },
      });

      res.status(201).json({ newKeyword, newReport });
    } catch (error) {
      console.error('Error adding keyword and AI results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
