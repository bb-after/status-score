import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow this in development or with a special query parameter
  if (process.env.NODE_ENV === 'production' && req.query.debug !== 'true') {
    return res.status(404).json({ error: 'Not found' });
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL ? '✓ Set' : '✗ Missing',
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL ? '✓ Set' : '✗ Missing',
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? '✓ Set' : '✗ Missing',
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ? '✓ Set' : '✗ Missing',
    AUTH0_SECRET: process.env.AUTH0_SECRET ? '✓ Set' : '✗ Missing',
    // Show actual values in development only
    ...(process.env.NODE_ENV !== 'production' && {
      AUTH0_BASE_URL_VALUE: process.env.AUTH0_BASE_URL,
      AUTH0_ISSUER_BASE_URL_VALUE: process.env.AUTH0_ISSUER_BASE_URL,
      AUTH0_CLIENT_ID_VALUE: process.env.AUTH0_CLIENT_ID,
    })
  };

  return res.status(200).json(envVars);
}