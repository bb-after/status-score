import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getGeminiSentiment } from '../../../utils/gemini';
import { getOpenAISentiment } from '../../../utils/openai';
import { getClaudeSentiment } from '../../../utils/claude';
import { getGoogleNewsSentiment } from '../../../utils/googleNews';
import { getGrokSentiment } from '../../../utils/grok';
import { analyzeSentimentGoogle } from '../../../utils/googleLanguage';
import { searchTwitter } from '../../../utils/twitter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { keywordId, dataSourceIds } = req.body;

    // Type Definition for AnalysisResult
    type AnalysisResult = {
      source: string;
      sentiment: string; // Assuming sentiment is always a string
      response: string;  // Assuming response is always a string
      score: number;
    };

    if (!keywordId) {
      return res.status(400).json({ error: 'Invalid input: keywordId is required' });
    }

    try {
      const keywordRecord = await prisma.keyword.findUnique({ where: { id: keywordId } });

      if (!keywordRecord) {
        return res.status(404).json({ error: 'Keyword not found' });
      }

      // Fetch all active data sources or use provided dataSourceIds to filter
      let dataSources;
      if (dataSourceIds && dataSourceIds.length > 0) {
        const parsedDataSourceIds = dataSourceIds.map((id: string) => parseInt(id, 10));
        dataSources = await prisma.dataSource.findMany({
          where: {
            id: { in: parsedDataSourceIds },
            active: true,
          },
        });
      } else {
        dataSources = await prisma.dataSource.findMany({ where: { active: true } });
      }

      if (dataSources.length === 0) {
        return res.status(400).json({ error: 'No active data sources found or selected' });
      }

      const analysisResults: AnalysisResult[] = [];
      let overallSentimentScore = 0;
      let sentimentCount = 0;

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
          default:
            continue;
        }

        let sentimentAnalysis = await analyzeSentimentGoogle(result.summary);
        console.log('analysis?', sentimentAnalysis);
        // Validate the result
        if (!result || !result.summary) {
          console.warn(`Invalid result for source ${source.name}`);
          continue; // Skip to the next data source if the result is invalid
        }

        // Parse sentiment into a numerical score
        let score = sentimentAnalysis.compositeScore;
        // switch (sentimentAnalysis.sentiment) {
        //   case 'positive':
        //     score = 3;
        //     break;
        //   case 'neutral':
        //     score = 2;
        //     break;
        //   case 'negative':
        //     score = 1;
        //     break;
        //   default:
        //     score = 0;
        // }

        // Add the result to the analysisResults array
        analysisResults.push({
          source: source.name,
          sentiment: sentimentAnalysis.sentiment,
          response: result.summary,
          score,
        });

        // Step 3: Create the DataSourceResult linked to the report
        await prisma.dataSourceResult.create({
          data: {
            prompt: source.prompt, // Store the prompt used
            payload: result, // Store the entire AI response as JSON
            report: { connect: { id: newReport.id } },
            dataSource: { connect: { id: source.id } },
            sentiment: sentimentAnalysis.sentiment,
            response: result.summary,
            score,
          },
        });

        overallSentimentScore += score;
        sentimentCount++;
      }

      // Calculate the overall sentiment score
      const calculatedOverallSentiment = sentimentCount
        ? (overallSentimentScore / sentimentCount).toFixed(2)
        : 'No sentiment found';

      // Step 4: Update the overall report with the final data
      await prisma.report.update({
        where: { id: newReport.id },
        data: {
          payload: analysisResults, // Store analysis results array
          sentiment: calculatedOverallSentiment,
          response: JSON.stringify(analysisResults), // Stores full results as JSON string
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
