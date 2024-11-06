import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getGeminiSentiment } from '../../../utils/gemini';
import { getOpenAISentiment } from '../../../utils/openai';
import { getClaudeSentiment } from '../../../utils/claude';
import { getGoogleNewsSentiment } from '../../../utils/googleNews';
import { getGrokSentiment } from '../../../utils/grok';
import { searchTwitter } from '../../../utils/twitter';
import { analyzeSentimentGoogle } from '../../../utils/googleLanguage';
import { searchReddit } from '../../../utils/reddit';
import { searchYouTube } from '../../../utils/youtube';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { keywordId, dataSourceIds } = req.body;

    if (!keywordId) {
      return res.status(400).json({ error: 'Invalid input: keywordId is required' });
    }

    try {
      const keywordRecord = await prisma.keyword.findUnique({ where: { id: keywordId } });

      if (!keywordRecord) {
        return res.status(404).json({ error: 'Keyword not found' });
      }

      // Fetch the specified active data sources, or use all active public data sources if none are provided
      let dataSources;
      if (dataSourceIds && dataSourceIds.length > 0) {
        dataSources = await prisma.dataSource.findMany({
          where: {
            id: { in: dataSourceIds.map((id) => Number(id)) },
            active: true,
          },
        });
      } else {
        // Default to all active public data sources if dataSourceIds isn't provided
        dataSources = await prisma.dataSource.findMany({
          where: {
            active: true,
            // isPublic: true, // Assuming `isPublic` is a field that indicates if the data source is public
          },
        });
      }

      if (!dataSources || dataSources.length === 0) {
        return res.status(404).json({ error: 'No valid data sources found' });
      }

      const analysisResults: any[] = [];
      let totalWeightedSentimentScore = 0;
      let totalWeight = 0;

      // Step 1: Create the overall report in the database first
      const newReport = await prisma.report.create({
        data: {
          aiEngine: 'All Sources',
          prompt: `Multi-source sentiment analysis for keyword: "${keywordRecord.name}"`,
          keyword: { connect: { id: keywordId } },
          user: { connect: { id: keywordRecord.userId } },
          payload: {}, // Placeholder, will be updated after collecting all results
          sentiment: "Pending", // Placeholder until we calculate final sentiment
          response: "Pending", // Placeholder
        },
      });

      // Step 2: Iterate through each data source and analyze sentiment
      for (const source of dataSources) {
        let result;

        switch (source.name.toLowerCase()) {
          case 'gemini':
            result = await getGeminiSentiment(keywordRecord.name, source.id);
            break;
          case 'openai gpt-4':
            result = await getOpenAISentiment(keywordRecord.name, source.id);
            break;
          case 'openai gpt-3.5':
            result = await getOpenAISentiment(keywordRecord.name, source.id);
            break;
          case 'claude':
            result = await getClaudeSentiment(keywordRecord.name, source.id);
            break;
          case 'google news':
            result = await getGoogleNewsSentiment(keywordRecord.name, source.id);
            break;
          case 'grok':
            result = await getGrokSentiment(keywordRecord.name, source.id);
            break;
          case 'twitter':
            result = await searchTwitter(keywordRecord.name);
            break;
          case 'reddit':
            result = await searchReddit(keywordRecord.name);
            break;
          case 'youtube':
            result = await searchYouTube(keywordRecord.name);
            break;
          default:
            continue;
        }

        if (!result || !result.summary) {
          console.warn(`Invalid result for source ${source.name}`);
          continue; // Skip to the next data source if the result is invalid
        }

        let sentimentAnalysis = await analyzeSentimentGoogle(result.summary);

        // Parse sentiment into a numerical score
        let score = sentimentAnalysis.score;

        // Apply the weighting of the data source to the score
        const weightedScore = score * source.weight;

        // Add the result to the analysisResults array
        analysisResults.push({
          source: source.name,
          sentiment: sentimentAnalysis.score,
          magnitude: sentimentAnalysis.magnitude,
          response: result.summary,
          score: weightedScore,
          weight: source.weight,
        });

        // Sum the weighted sentiment scores
        totalWeightedSentimentScore += weightedScore;
        totalWeight += source.weight;
      }

      // Calculate the overall sentiment score
      const calculatedOverallSentiment = totalWeight
        ? (totalWeightedSentimentScore / totalWeight).toFixed(2)
        : 'No sentiment found';

      // Step 4: Update the overall report with the final data
      await prisma.report.update({
        where: { id: newReport.id },
        data: {
          payload: analysisResults,
          sentiment: calculatedOverallSentiment,
          response: JSON.stringify(analysisResults),
        },
      });

      // Respond with the calculated sentiment and individual analysis results
      res.status(201).json({
        overallSentiment: calculatedOverallSentiment,
        analysisResults,
      });
    } catch (error) {
      console.error('Error running keyword analysis for all sources:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
