import { NextApiRequest, NextApiResponse } from 'next';

// Sample data for keywords and sentiment scores
const keywordsData = [
  { keyword: 'OpenAI', score: 75 },
  { keyword: 'Next.js', score: 85 },
  { keyword: 'React', score: 90 },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return the keywords and their sentiment scores
    res.status(200).json(keywordsData);
  } else {
    // Handle other HTTP methods
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
