// pages/api/keywords/add.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getOpenAISentiment } from '../../../utils/openai';
import { getGeminiSentiment } from '../../../utils/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { keyword, userId } = req.body;

    if (!keyword || !userId) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    try {
      // Step 1: Store the Keyword in the Database
      const newKeyword = await prisma.keyword.create({
        data: {
          name: keyword,
          user: { connect: { id: userId } },
        },
      });

      // Step 2: Mock the AI Engine Result (Simulate fetching from an AI engine)
      // Note: Replace this with a real API call to an AI engine later
      // const aiResult = await getOpenAISentiment(keyword);
      const aiResult = await getGeminiSentiment(keyword);

      // Step 3: Store the AI Engine Result in the Database
      const newReport = await prisma.report.create({
        data: {
          aiEngine: 'Gemini', // Update this with the actual engine name
          payload: aiResult, // This should be the result from the AI engine
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
