import { createMockRequestResponse } from './setup';
import handler from '../places';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Places API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if input parameter is missing', async () => {
    const { req, res } = createMockRequestResponse('GET', {}, {});
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Input parameter is required',
    });
  });

  it('returns places data on successful request', async () => {
    const mockPlacesResponse = {
      data: {
        predictions: [
          {
            description: 'New York, NY, USA',
            place_id: 'abc123',
          },
        ],
      },
    };

    mockedAxios.get.mockResolvedValueOnce(mockPlacesResponse);

    const { req, res } = createMockRequestResponse('GET', {}, { input: 'New York' });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockPlacesResponse.data.predictions);
  });

  it('handles API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    const { req, res } = createMockRequestResponse('GET', {}, { input: 'New York' });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Failed to fetch places',
    });
  });

  it('returns 405 for non-GET requests', async () => {
    const { req, res } = createMockRequestResponse('POST', {}, { input: 'New York' });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method POST Not Allowed',
    });
  });
});
