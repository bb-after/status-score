import axios from 'axios';
import { getDataSourceById } from './dataSource';

export async function getClaudeSentiment(keyword: string, dataSourceId: number) {
  try {
    const dataSource = await getDataSourceById(dataSourceId);
    const prompt = dataSource.prompt.replace("{keyword}", keyword);

    const anthropicApiKey = process.env.CLAUDE_API_KEY;
    if (!anthropicApiKey) {
      throw new Error('CLAUDE_API_KEY is not set in environment variables.');
    }

    const response = await axios.post(
      'https://api.anthropic.com/v1/completions',
      {
        model: dataSource.model,
        prompt,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${anthropicApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = response.data?.completion || 'No response available';

    return {
      sentiment: 'positive', // Placeholder sentiment until parsing logic is added
      summary: result,
    };
  } catch (error) {
    console.error('Error fetching data from Claude:', error);
    throw new Error('Failed to get Claude result');
  }
}
