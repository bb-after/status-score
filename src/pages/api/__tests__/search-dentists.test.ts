import { createMockRequestResponse } from './setup';
import handler from '../search-dentists';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Search Dentists API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_PLACES_API_KEY = 'test-api-key';
  });

  it('returns 400 if city parameter is missing', async () => {
    const { req, res } = createMockRequestResponse('GET', {}, {});
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'City is required',
    });
  });

  it('returns dentists on successful search', async () => {
    const mockPlacesResponse = {
      data: {
        results: [
          {
            name: 'Test Dental',
            rating: 4.5,
            user_ratings_total: 100,
            formatted_address: '123 Test St',
            place_id: 'test123',
          },
        ],
        next_page_token: 'next-token',
      },
    };

    const mockDetailsResponse = {
      data: {
        result: {
          reviews: [
            {
              author_name: 'Test User',
              rating: 2,
              text: 'Not great',
              time: 1234567890,
            },
          ],
        },
      },
    };

    mockedAxios.get
      .mockResolvedValueOnce(mockPlacesResponse)
      .mockResolvedValueOnce(mockDetailsResponse);

    const { req, res } = createMockRequestResponse('GET', {}, {
      city: 'New York',
      type: 'dentist',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toHaveProperty('results');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      expect.any(Object)
    );
  });

  it('handles API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    const { req, res } = createMockRequestResponse('GET', {}, {
      city: 'New York',
      type: 'dentist',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });

  it('returns 405 for non-GET requests', async () => {
    const { req, res } = createMockRequestResponse('POST', {}, {
      city: 'New York',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed',
    });
  });
});
