import axios from 'axios';
import { getDataSourceById } from './dataSource';

export async function searchPerplexity(keyword: string, dataSourceId: number) {
  try {
    const dataSource = await getDataSourceById(dataSourceId);
    const prompt = dataSource.prompt.replace("{keyword}", keyword);

    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY is not set in environment variables.');
    }

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: dataSource.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Perplexity API response structure is similar to OpenAI
    const result = response.data?.choices?.[0]?.message?.content || 'No response available';

    return {
      sentiment: 'positive', // Placeholder sentiment until parsing logic is added
      summary: result,
    };
  } catch (error) {
    console.error('Error fetching data from Perplexity:', error);
    throw new Error('Failed to get Perplexity result');
  }
}