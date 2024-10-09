import OpenAI from 'openai';

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
        dangerouslyAllowBrowser: true, // If you're testing in the browser
      });
    }
    return openAIClient;
  };
})();

/**
 * Function to get sentiment or content related to the keyword from OpenAI.
 * @param keyword - The keyword to analyze.
 * @returns Sentiment analysis result.
 */
export async function getOpenAISentiment(keyword: string) {
  try {
    const openai = getOpenAIClient();
    const messages: OpenAI.Chat.CreateChatCompletionRequestMessage[] = [
        {
          role: 'user',
          content: `Analyze the sentiment of the following keyword and give a summary: "${keyword}"`,
        },
      ];
  
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use a valid chat model
      temperature: 0.8,
      messages,
      max_tokens: 100,
    });

    // Extracting the response text safely
    const resultText = response.choices[0]?.message?.content?.trim() || 'No response';

    return {
      sentiment: 'positive', // Placeholder sentiment for now, you could parse the response
      summary: resultText,
    };
  } catch (error) {
    console.error('Error fetching data from OpenAI:', error);
    throw new Error('Failed to get OpenAI result');
  }
}
