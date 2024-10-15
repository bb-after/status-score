import axios from 'axios';
import { getDataSourceById } from './dataSource';

export async function getGoogleNewsSentiment(keyword: string, dataSourceId: number) {
  try {
    const dataSource = await getDataSourceById(dataSourceId);
    const prompt = dataSource.prompt.replace("{keyword}", keyword);

    const googleApiKey = process.env.GOOGLE_NEWS_API_KEY;
    const googleCx = process.env.GOOGLE_CX; // Programmable Search Engine ID

    if (!googleApiKey || !googleCx) {
      throw new Error('GOOGLE_NEWS_API_KEY or GOOGLE_CX is not set in environment variables.');
    }

    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1?q=${keyword}&cx=${googleCx}&key=${googleApiKey}`
    );

    const articles = response.data.items || [];
    let combinedText = articles.map((article) => article.snippet).join('. ');

    // Here we can use another service, for simplicity we'll return it directly.
    return {
      summary: `Found ${articles.length} articles. Combined summary: ${combinedText}`,
    };
  } catch (error) {
    console.error('Error fetching data from Google News:', error);
    throw new Error('Failed to get Google News result');
  }
}
