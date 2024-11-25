import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

type PlaceResult = {
  name: string;
  rating: number;
  totalReviews: number;
  address: string;
  placeId: string;
  photoUrl?: string;
  negativeReviewCount: number;
  negativeReviews: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { city, type } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const allResults: PlaceResult[] = []; // Explicitly type the array
    let nextPageToken: string | undefined = undefined;

    do {
      const params = {
        key: GOOGLE_PLACES_API_KEY,
        query: `${type} in ${city}`,
        type: type || 'dentist',
        pagetoken: nextPageToken,
      };

      // API call: Get search results
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', { params });

      // Map results and fetch detailed reviews for each place
      const results = await Promise.all(
        response.data.results.map(async (place: any) => {
          const detailedResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
              place_id: place.place_id,
              key: GOOGLE_PLACES_API_KEY,
              fields: 'name,reviews',
            },
          });
          
          const reviews = detailedResponse.data.result.reviews || [];
          const negativeReviews = reviews.filter((review) => review.rating <= 2); // Filter 1- and 2-star reviews

          return {
            name: place.name,
            rating: place.rating || 0,
            totalReviews: place.user_ratings_total || 0,
            address: place.formatted_address || '',
            placeId: place.place_id,
            photoUrl: place.photos?.[0]?.photo_reference
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
              : undefined,
            negativeReviewCount: negativeReviews.length,
            negativeReviews: negativeReviews || [], // Ensure it's always an array
          };
        })
      );

      allResults.push(...results);
      nextPageToken = response.data.next_page_token;

      // Wait a couple of seconds before fetching the next page to ensure the next_page_token becomes valid.
      if (nextPageToken) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

    } while (nextPageToken && allResults.length < 200); // Fetch a max of 60 results, you can adjust this number

    res.status(200).json({
      results: allResults,
      totalResults: allResults.length,
    });
  } catch (error: any) {
    console.error('Error fetching places:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
}
