import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDataSourceById } from './dataSource';

/**
 * Function to initialize and cache the Gemini API client
 */
const getGeminiClient = (() => {
  let genAIClient: GoogleGenerativeAI | undefined;

  return () => {
    if (!genAIClient) {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
      }

      // Initialize the client with the API key
      genAIClient = new GoogleGenerativeAI(apiKey);
    }
    return genAIClient;
  };
})();

/**
 * Function to get sentiment or content related to the keyword from Gemini.
 * @param keyword - The keyword to analyze.
 * @param dataSourceId - The ID of the data source to get configuration from the database
 * @returns Sentiment analysis result.
 */
export async function getGeminiSentiment(keyword: string, dataSourceId: number) {
  try {
    
    // Fetch the data source configuration using the utility function
    const dataSource = await getDataSourceById(dataSourceId);
    
    // Get the client to use for the request
    const genAI = getGeminiClient();

    // Use the model ID and prompt from the data source
    const model = genAI.getGenerativeModel({ model: dataSource.model });
    const prompt = dataSource.prompt.replace("{keyword}", keyword); // Replace placeholder with actual keyword

    // Use the model to generate content
    const result = await model.generateContent(prompt);

    // Extract and return the generated response
    const generatedText = result.response.text();

    // Return the result with placeholder sentiment
    return {
      summary: generatedText,
    };
  } catch (error) {
    console.error('Error fetching data from Gemini:', error);
    throw new Error('Failed to get Gemini result');
  }
}
