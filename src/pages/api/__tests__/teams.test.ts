import { createMockRequestResponse } from './setup';
import handler from '../teams';
import { prisma } from '../../../lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';

jest.mock('@auth0/nextjs-auth0');
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    team: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockSession = {
  user: {
    sub: 'auth0|123',
    email: 'test@example.com',
  },
};

describe('Teams API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/teams', () => {
    it('returns user teams on successful request', async () => {
      const mockTeams = [
        {
          id: 1,
          name: 'Test Team',
          ownerId: 'auth0|123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.team.findMany as jest.Mock).mockResolvedValueOnce(mockTeams);

      const { req, res } = createMockRequestResponse('GET', {}, {});
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockTeams);
    });

    it('returns 401 if not authenticated', async () => {
      (getSession as jest.Mock).mockResolvedValueOnce(null);

      const { req, res } = createMockRequestResponse('GET', {}, {});
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Not authenticated',
      });
    });
  });

  describe('POST /api/teams', () => {
    it('creates a new team successfully', async () => {
      const mockTeam = {
        id: 1,
        name: 'New Team',
        ownerId: 'auth0|123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.team.create as jest.Mock).mockResolvedValueOnce(mockTeam);

      const { req, res } = createMockRequestResponse('POST', { name: 'New Team' }, {});
      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockTeam);
    });

    it('returns 400 if team name is missing', async () => {
      const { req, res } = createMockRequestResponse('POST', {}, {});
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Team name is required',
      });
    });
  });

  describe('PUT /api/teams', () => {
    it('updates a team successfully', async () => {
      const mockTeam = {
        id: 1,
        name: 'Updated Team',
        ownerId: 'auth0|123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValueOnce({ ...mockTeam, name: 'Old Name' });
      (prisma.team.update as jest.Mock).mockResolvedValueOnce(mockTeam);

      const { req, res } = createMockRequestResponse('PUT', { id: 1, name: 'Updated Team' }, {});
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockTeam);
    });

    it('returns 404 if team not found', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const { req, res } = createMockRequestResponse('PUT', { id: 999, name: 'Updated Team' }, {});
      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Team not found',
      });
    });
  });

  describe('DELETE /api/teams', () => {
    it('deletes a team successfully', async () => {
      const mockTeam = {
        id: 1,
        name: 'Team to Delete',
        ownerId: 'auth0|123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.team.findUnique as jest.Mock).mockResolvedValueOnce(mockTeam);
      (prisma.team.delete as jest.Mock).mockResolvedValueOnce(mockTeam);

      const { req, res } = createMockRequestResponse('DELETE', { id: 1 }, {});
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Team deleted successfully' });
    });

    it('returns 404 if team not found', async () => {
      (prisma.team.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const { req, res } = createMockRequestResponse('DELETE', { id: 999 }, {});
      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Team not found',
      });
    });
  });

  it('returns 405 for unsupported methods', async () => {
    const { req, res } = createMockRequestResponse('PATCH', {}, {});
    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method PATCH Not Allowed',
    });
  });
});
