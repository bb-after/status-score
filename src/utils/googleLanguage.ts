import axios from 'axios';
import { request } from 'http';

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
    console.log("body to analyze", text);
    console.log("and the sentiment is....",sentimentData);

    // Define thresholds for classification
    // const magnitudeThreshold = 0.5;  // Adjust based on how strong we want the sentiment to be considered

    const compositeScore = (() => {
      const { score, magnitude } = sentimentData;
  
      // Calculate composite score to incorporate both direction and strength
      return score * magnitude;
    })();

    return {
      score: sentimentData.score,          // Sentiment score between -1.0 (negative) and 1.0 (positive)
      magnitude: sentimentData.magnitude,  // Indicates the strength of sentiment
      compositeScore: compositeScore,
      sentiment:
         compositeScore > 0.25
           ? 'positive'
           : compositeScore < -0.25 || (compositeScore < 0.25 && sentimentData.magnitude >= 5)
           ? 'negative' 
           : 'neutral', // General sentiment classification based on score
    };
    
    // if (magnitude < magnitudeThreshold) {
    //   return 'neutral';  // If magnitude is too low, sentiment is classified as neutral
    // }

    // // Strong enough sentiment - we can make a classification
    // if (score > 0.25 && magnitude >= magnitudeThreshold) {
    //   return 'positive';
    // } else if (score < -0.25 && magnitude >= magnitudeThreshold) {
    //   return 'negative';
    // } else {
    //   return 'neutral';
    // }

    // Format the response in a structured way
    // return {
    //   score: sentimentData.score,          // Sentiment score between -1.0 (negative) and 1.0 (positive)
    //   magnitude: sentimentData.magnitude,  // Indicates the strength of sentiment
    //   sentiment:
    //     sentimentData.score > 0.25
    //       ? 'positive'
    //       : sentimentData.score < -0.25
    //       ? 'negative'
    //       : 'neutral', // General sentiment classification based on score
    // };
  } catch (error) {
    console.error('Error while analyzing sentiment with Google Natural Language API:', error);
    throw new Error('Failed to get sentiment analysis from Google Natural Language API');
  }
}
