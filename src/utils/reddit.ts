// utils/reddit.ts
import axios from 'axios';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
  throw new Error('Reddit credentials are not set in environment variables');
}

// Function to authenticate with Reddit API and get an access token (application-only auth)
async function getRedditAccessToken(): Promise<string> {
  const credentials = `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`;
  const encodedCredentials = Buffer.from(credentials).toString('base64');

  try {
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'KeywordAnalyzerBot/1.0', // Replace with your unique User-Agent
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error obtaining Reddit access token:', error);
    throw new Error('Failed to obtain Reddit access token');
  }
}

// Function to search Reddit for posts related to a keyword
export async function searchReddit(keyword: string) {
  try {
    const accessToken = await getRedditAccessToken();

    const response = await axios.get(
      `https://oauth.reddit.com/search?q=${encodeURIComponent(keyword)}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'KeywordAnalyzerBot/1.0',
        },
      }
    );

    if (response.data && response.data.data && response.data.data.children) {
      const posts = response.data.data.children.map((child: any) => {
        return {
          id: child.data.id,
          title: child.data.title,
          content: child.data.selftext || 'No content available',
        };
      });

      return {
        summary: posts.map(post => post.title + ': ' + post.content).join(' '), // Combine posts as a summary
        payload: posts,
      };
    } else {
      throw new Error('No data received from Reddit API');
    }
  } catch (error) {
    console.error('Error fetching posts from Reddit:', error);
    throw new Error('Failed to fetch Reddit data');
  }
}
