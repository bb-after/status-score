import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getGeminiSentiment } from '../../../utils/gemini';
import { getOpenAISentiment } from '../../../utils/openai';
import { getClaudeSentiment } from '../../../utils/claude';
import { getGoogleNewsSentiment } from '../../../utils/googleNews';
import { getGrokSentiment } from '../../../utils/grok';
import { analyzeSentimentGoogle } from '../../../utils/googleLanguage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { keyword, aiEngine, dataSourceId } = req.body;

    if (!keyword || !aiEngine || !dataSourceId) {
      return res.status(400).json({ error: 'Invalid input: keyword, aiEngine, and dataSourceId are required' });
    }

    try {
      // Fetch the data source information from Prisma
      const dataSource = await prisma.dataSource.findUnique({
        where: {
          id: Number(dataSourceId),
        },
      });

      if (!dataSource) {
        return res.status(400).json({ error: 'Data source not found' });
      }

      // Replace keyword placeholder in the prompt
      const prompt = dataSource.prompt.replace("{keyword}", keyword);

      let aiResult;

      // Step 1: Fetch result from the selected AI engine
      if (aiEngine === 'Gemini') {
        aiResult = await getGeminiSentiment(keyword, dataSourceId);
      } else if (aiEngine.toLowerCase().includes('openai')) {
        aiResult = await getOpenAISentiment(keyword, dataSourceId);
      } else if (aiEngine.toLowerCase().includes('claude')) {
        aiResult = await getClaudeSentiment(keyword, dataSourceId);
      } else if (aiEngine.toLowerCase().includes('google news')) {
        aiResult = await getGoogleNewsSentiment(keyword, dataSourceId);
      } else if (aiEngine.toLowerCase().includes('grok')) {
        aiResult = await getGrokSentiment(keyword, dataSourceId);
      } else {
        return res.status(400).json({ error: 'Invalid AI Engine selected' });
      }

      // Check if the AI result is valid
      if (!aiResult || !aiResult.summary) {
        return res.status(400).json({ error: 'AI result is empty or invalid' });
      }

      // Hardcoded userId for now (change this to your authenticated user's ID when ready)
      const userId = 1;

      // Step 2: Create or fetch the Keyword record
      const existingKeyword = await prisma.keyword.findFirst({
        where: {
          name: keyword,
          userId: userId,
        },
      });

      let keywordRecord;
      if (existingKeyword) {
        keywordRecord = existingKeyword;
      } else {
        keywordRecord = await prisma.keyword.create({
          data: {
            name: keyword,
            user: { connect: { id: userId } },
          },
        });
      }

      // Step 3: Analyze sentiment of the AI result using Google Natural Language API
      const sentimentAnalysis = await analyzeSentimentGoogle(aiResult.summary);
      console.log('sentiment?', sentimentAnalysis);

      // Step 4: Create the report
      const newReport = await prisma.report.create({
        data: {
          aiEngine: aiEngine, // Store the name of the AI engine
          prompt: prompt, // Store the prompt used
          response: aiResult.summary, // Store the AI engine's response
          sentiment: sentimentAnalysis.sentiment, // Store the analyzed sentiment
          payload: aiResult, // Save the entire AI response as JSON
          keyword: { connect: { id: keywordRecord.id } }, // Connect to the created or fetched keyword
          user: { connect: { id: userId } },
        },
      });

      // Step 5: Create the data source result linked to the report
      await prisma.dataSourceResult.create({
        data: {
          report: { connect: { id: newReport.id } },
          dataSource: { connect: { id: Number(dataSourceId) } },
          prompt: prompt, // Store the prompt used
          payload: aiResult, // Save the entire AI response as JSON
          sentiment: sentimentAnalysis.sentiment,
          response: aiResult.summary,
          score: sentimentAnalysis.score || 0, // Assuming the score is part of the sentimentAnalysis result
        },
      });

      // Send the newly created report as a response
      res.status(201).json(newReport);

    } catch (error) {
      console.error('Error adding keyword and AI results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
