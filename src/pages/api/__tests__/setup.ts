import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

export const createMockRequestResponse = (method: string = 'GET', body: any = {}, query: any = {}) => {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method,
    body,
    query,
  });

  return { req, res };
};

// Mock Auth0 session
export const mockSession = {
  user: {
    email: 'test@example.com',
    sub: 'auth0|123456789',
  },
  accessToken: 'mock-access-token',
};

// Mock Prisma client
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      team: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      teamMember: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      report: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      keyword: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    })),
  };
});

// Mock Auth0 session handling
jest.mock('@auth0/nextjs-auth0', () => ({
  getSession: jest.fn(() => mockSession),
  withApiAuthRequired: (handler: any) => handler,
}));
