import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  throw new Error('YOUTUBE_API_KEY is not set in environment variables');
}

interface YouTubeSearchResult {
  summary: string;
  payload: {
    id: string;
    title: string;
    description: string;
  }[];
}

export async function searchYouTube(keyword: string): Promise<YouTubeSearchResult> {
  try {
    // Step 1: Fetch videos related to the keyword
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: keyword,
        maxResults: 15, // Adjust the number of results as needed
        key: YOUTUBE_API_KEY,
      },
    });

    // Step 2: Check for valid response
    if (response.data && response.data.items) {
      const videoResults = response.data.items.map((video: any) => ({
        id: video.id.videoId,
        title: video.snippet.title,
        description: video.snippet.description,
      }));
      console.log('video results', videoResults);
      // Create a summary by joining the titles and descriptions together
      const summary = videoResults
        .map(video => `${video.title}. ${video.description}`)
        .join('\n\n');

      // Return the formatted result
      return {
        summary,
        payload: videoResults,
      };
    } else {
      throw new Error('No data received from YouTube API');
    }
  } catch (error) {
    console.error('Error fetching data from YouTube:', error);
    throw new Error('Failed to fetch YouTube data');
  }
}
