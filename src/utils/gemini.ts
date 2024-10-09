import { GoogleGenerativeAI } from '@google/generative-ai';

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
 * @returns Sentiment analysis result.
 */
export async function getGeminiSentiment(keyword: string) {
  try {
    // Get the client to use for the request
    const genAI = getGeminiClient();

    // Get a model instance with the appropriate model ID
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Define the prompt
    const prompt = `Analyze the sentiment of the following keyword and provide a summary: "${keyword}"`;

    // Use the model to generate content
    const result = await model.generateContent(prompt);

    // Extract and return the generated response
    const generatedText = result.response.text();

    // Return the result with placeholder sentiment
    return {
      sentiment: 'positive', // Placeholder sentiment
      summary: generatedText,
    };
  } catch (error) {
    console.error('Error fetching data from Gemini:', error);
    throw new Error('Failed to get Gemini result');
  }
}
