import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getAuthenticatedUserId } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Request method:', req.method);
  console.log('Request query:', req.query);
  
  const userId = await getAuthenticatedUserId(req, res);
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User ID is required' });
  }
  
  switch (req.method) {
    case 'GET':
      return handleGetSchedules(userId, res);
    case 'POST':
      return handleCreateSchedule(req.body, userId, res);
    case 'PUT':
      return handleUpdateSchedule(req.body, userId, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleGetSchedules(userId: number, res: NextApiResponse) {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { 
        userId: userId,
        deletedAt: null,
      },
      include: { keyword: true },
    });
    console.log('scheds', schedules);
    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Error fetching schedules' });
  }
}

async function handleCreateSchedule(body: any, userId: number, res: NextApiResponse) {
  const { keywordId, frequency, emails } = body;

  if (!keywordId || !frequency || !emails) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const existingSchedule = await prisma.schedule.findFirst({
      where: { 
        keywordId: Number(keywordId),
        userId: userId,
        deletedAt: null // Only check for active schedules
      },
    });

    if (existingSchedule) {
      return res.status(400).json({ error: 'An active schedule already exists for the selected keyword' });
    }

    const newSchedule = await prisma.schedule.create({
      data: { 
        keywordId: Number(keywordId), 
        frequency, 
        emails, 
        userId 
      },
    });

    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Error creating schedule' });
  }
}

async function handleUpdateSchedule(body: any, userId: number, res: NextApiResponse) {
  const { id, newFrequency, newEmails } = body;

  if (!id || !newFrequency || !newEmails) {
    return res.status(400).json({ error: 'Invalid input for updating schedule' });
  }

  try {
    const updatedSchedule = await prisma.schedule.updateMany({
      where: { id: Number(id), userId: userId },
      data: { frequency: newFrequency, emails: newEmails },
    });

    if (updatedSchedule.count === 0) {
      return res.status(404).json({ error: 'Schedule not found or unauthorized' });
    }

    res.status(200).json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Error updating schedule' });
  }
}

