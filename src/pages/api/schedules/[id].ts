import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getAuthenticatedUserId } from '../../../lib/auth';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('1. Handler started');
  console.log('Request method:', req.method);
  console.log('Request query:', req.query);
  
  if (req.method !== 'DELETE') {
    console.log('2. Method not DELETE');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  console.log('3. Method is DELETE');

  let userId;
  try {
    console.log('4. Getting userId');
    userId = await getAuthenticatedUserId(req, res);
    console.log('5. Got userId:', userId);
  } catch (error) {
    console.error('6. Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }

  if (!userId) {
    console.log('7. No userId found');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log('8. userId validation passed');

  const { id } = req.query;
  console.log('9. Query id:', id);
  
  if (!id || typeof id !== 'string') {
    console.log('10. Invalid id type or missing');
    return res.status(400).json({ error: 'Invalid schedule ID' });
  }
  console.log('11. id validation passed');

  const scheduleId = Number(id);
  console.log('12. Parsed scheduleId:', scheduleId);
  
  if (isNaN(scheduleId)) {
    console.log('13. scheduleId is not a number');
    return res.status(400).json({ error: 'Invalid schedule ID format' });
  }
  console.log('14. scheduleId validation passed');

  try {
    console.log('15. Attempting Prisma delete with:', { scheduleId, userId });
    
    const result = await prisma.$transaction(async (tx) => {
      console.log('15a. Inside transaction');
      const updatedSchedule = await prisma.schedule.update({
        where: {
          id: scheduleId,
          userId,
        },
        data: {
          deletedAt: new Date()
        }
      });
    
      console.log('15b. Delete completed:', updatedSchedule);
      return updatedSchedule;
    });
    
    console.log('16. Transaction successful:', result);
    
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('17. Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    if (error.code === 'P2025') {
      console.log('18. Record not found');
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }
    
    console.error('19. Unknown error');
    res.status(500).json({ error: 'Error deleting schedule' });
  }
  
  console.log('20. Handler completed');
}