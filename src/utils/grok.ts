import axios from 'axios';
import { getDataSourceById } from './dataSource';

/**
 * Function to get sentiment or content related to the keyword from Grok.
 * @param keyword - The keyword to analyze.
 * @param dataSourceId - The ID of the data source to get configuration from the database
 * @returns Sentiment analysis result.
 */
export async function getGrokSentiment(keyword: string, dataSourceId: number) {
  try {
    const dataSource = await getDataSourceById(dataSourceId);
    const prompt = dataSource.prompt.replace("{keyword}", keyword);

    const grokApiUrl = process.env.GROK_API_URL;
    const apiKey = process.env.GROK_API_KEY;

    if (!grokApiUrl || !apiKey) {
      throw new Error('GROK_API_URL or GROK_API_KEY is not set in the environment variables.');
    }

    const response = await axios.post(
      grokApiUrl,
      {
        model: dataSource.model,
        prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const generatedText = response.data?.output?.text || 'No response available';

    return {
      summary: generatedText,
    };
  } catch (error) {
    console.error('Error fetching data from Grok:', error);
    throw new Error('Failed to get Grok result');
  }
}
