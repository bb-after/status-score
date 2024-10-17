// utils/twitter.ts
import axios from 'axios';

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

if (!BEARER_TOKEN) {
  throw new Error('TWITTER_BEARER_TOKEN is not set in environment variables');
}

interface TwitterSearchResult {
  summary: string;
  payload: {
    id: string;
    text: string;
  }[];
}

export async function searchTwitter(keyword: string): Promise<TwitterSearchResult> {
  try {
    // Fetch tweets from Twitter API
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      params: {
        query: keyword,
        max_results: 10, // Adjust the number as needed
      },
    });

    // Check for valid response
    if (response.data && response.data.data) {
      const tweetResults = response.data.data.map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text,
      }));

      // Create a summary by joining the tweet texts together
      const summary = tweetResults.map(tweet => tweet.text).join(' ');

      // Return the formatted result
      return {
        summary,
        payload: tweetResults,
      };
    } else {
      throw new Error('No data received from Twitter API');
    }
  } catch (error) {
    console.error('Error fetching tweets from Twitter:', error);
    throw new Error('Failed to fetch Twitter data');
  }
}
