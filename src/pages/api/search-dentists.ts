import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { city, type, pageToken } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const params = {
      key: GOOGLE_PLACES_API_KEY,
      query: `${type} in ${city}`,
      type: 'dentist',
      pagetoken: pageToken || undefined,
    };

    // First API call: Get search results
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', { params });

    // Map results and fetch detailed reviews for each dentist
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

    res.status(200).json({
      results,
      nextPageToken: response.data.next_page_token || null,
    });
  } catch (error: any) {
    console.error('Error fetching dentists:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch dentists' });
  }
}
