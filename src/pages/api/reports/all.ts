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

      // Fetch data sources, use all if dataSourceIds is undefined or empty
      const dataSources = await prisma.dataSource.findMany({
        where: {
          id: dataSourceIds && dataSourceIds.length > 0 ? { in: dataSourceIds.map((id) => Number(id)) } : undefined,
          active: true,
        },
      });

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
        try {
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
            case 'youtube': // New YouTube data source case
              result = await searchYouTube(keywordRecord.name);
              break;

            default:
              throw new Error(`Unknown data source: ${source.name}`);
          }

          // Validate the result
          if (!result || !result.summary) {
            throw new Error(`Invalid result for source ${source.name}`);
          }

          // Perform sentiment analysis
          let sentimentAnalysis = await analyzeSentimentGoogle(result.summary);
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
            weight: source.weight
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
              score: score,
              magnitude: sentimentAnalysis.magnitude || 0,
            }});

            // Sum the weighted sentiment scores
          totalWeightedSentimentScore += weightedScore;
          totalWeight += source.weight;
        } catch (err) {
          console.error(`Error processing source ${source.name}:`, err);

          // Log the failure in the results array
          analysisResults.push({
            source: source.name,
            error: err.message,
          });
        }
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

