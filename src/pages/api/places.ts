import axios from 'axios';
import { DentistResult, SearchResults } from '../../types/types';

export async function searchDentists(city: string, type: string, pageToken?: string, nextPageToken?: string): Promise<SearchResults> {
  try {
    const response = await axios.get('/api/search-dentists', {
      params: {
        city,
        type,
        pageToken,
      },
    });

    // Log the response data
    console.log('API Response Data:', response.data);

    // Directly assign the results without remapping
    const results: DentistResult[] = response.data.results;

    // Log the results
    console.log('Processed Results:', results);

    return {
      results,
      nextPageToken: response.data.nextPageToken,
    };
  } catch (error) {
    console.error('Error fetching dentists:', error);
    throw error;
  }
}
