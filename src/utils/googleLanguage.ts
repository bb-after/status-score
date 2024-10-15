import axios from 'axios';

export async function analyzeSentimentGoogle(text: string) {
  try {
    // Define the request body as per Google Natural Language API documentation
    const requestBody = {
      document: {
        type: 'PLAIN_TEXT',
        content: text,
      },
      encodingType: 'UTF8',
    };

    // Define the URL for the API request
    const apiKey = process.env.GOOGLE_NATURAL_LANGUAGE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_NATURAL_LANGUAGE_API_KEY is not set in environment variables.');
    }

    const url = `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${apiKey}`;

    // Make the request to Google Natural Language API
    const response = await axios.post(url, requestBody);
    const sentimentData = response.data.documentSentiment;

    // Format the response in a structured way
    return {
      score: sentimentData.score,          // Sentiment score between -1.0 (negative) and 1.0 (positive)
      magnitude: sentimentData.magnitude,  // Indicates the strength of sentiment
      sentiment:
        sentimentData.score > 0.25
          ? 'positive'
          : sentimentData.score < -0.25
          ? 'negative'
          : 'neutral', // General sentiment classification based on score
    };
  } catch (error) {
    console.error('Error while analyzing sentiment with Google Natural Language API:', error);
    throw new Error('Failed to get sentiment analysis from Google Natural Language API');
  }
}
