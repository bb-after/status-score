import OpenAI from 'openai';
import { getDataSourceById } from './dataSource'; // Import the utility function

/**
 * Function to initialize and cache the OpenAI client
 */
const getOpenAIClient: () => OpenAI = (() => {
  let openAIClient: OpenAI | undefined;

  return () => {
    if (!openAIClient) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
      }
      const organization = process.env.OPENAI_ORGANIZATION_ID;
      if (!organization) {
        throw new Error('OPENAI_ORGANIZATION_ID is not set');
      }

      openAIClient = new OpenAI({
        apiKey,
        organization,
        dangerouslyAllowBrowser: true,
      });
    }
    return openAIClient;
  };
})();

/**
 * Function to get sentiment or content related to the keyword from OpenAI.
 * @param keyword - The keyword to analyze.
 * @param dataSourceId - The ID of the data source to get configuration from the database
 * @returns Sentiment analysis result.
 */
export async function getOpenAISentiment(keyword: string, dataSourceId: number) {
  try {

    // Fetch the data source configuration using the utility function
    const dataSource = await getDataSourceById(dataSourceId);

    // Get the OpenAI client
    const openai = getOpenAIClient();

    // Prepare the prompt dynamically using the value from the database
    const prompt = dataSource.prompt.replace("{keyword}", keyword);

    console.log('show the prompt for this keyword...', keyword);
    console.log('prompt...', prompt);
    const messages: OpenAI.Chat.CreateChatCompletionRequestMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    // Call OpenAI API with the model specified in the data source
    const response = await openai.chat.completions.create({
      model: dataSource.model,
      temperature: 0.8,
      messages,
      // max_tokens: 100,
    });

    // Extracting the response text safely
    const resultText = response.choices[0]?.message?.content?.trim() || 'No response';
    console.log('response for keyword '+ keyword, resultText);

    return {
      summary: resultText,
    };
  } catch (error) {
    console.error('Error fetching data from OpenAI:', error);
    throw new Error('Failed to get OpenAI result');
  }
}
