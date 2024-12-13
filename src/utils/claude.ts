import axios from 'axios';
import { getDataSourceById } from './dataSource';

export async function getClaudeSentiment(keyword: string, dataSourceId: number) {
  try {
    const dataSource = await getDataSourceById(dataSourceId);
    const prompt = dataSource.prompt.replace("{keyword}", keyword);
    const engine = dataSource.model;
    const maxAnthropicTokens = 8192;
    
    const getAnthropicApiKey = (): string => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('Missing Anthropic API Key in environment variables.');
      }
      return apiKey;
    };

    try {
      const apiKey = getAnthropicApiKey();
      const messages = [
        { role: 'user', content: prompt },
      ];
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: engine,
          max_tokens: maxAnthropicTokens,
          messages: messages,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'content-type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
        }
      );
  
      console.log('Anthropic API Response:', response.data);
      const result = response.data.content[0].text || 'No Summary available';
      return {
        summary: result,
      };
    } catch (error: any) {
      console.error('Anthropic API Error:', error.response?.data || error.message || error);
      throw new Error('Failed to fetch response from Anthropic API.');
    }

  } catch (error) {
    console.error('Error fetching data from Claude:', error);
    throw new Error('Failed to get Claude result');
  }
}
