import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = 1; // Hardcoded user ID for now

  switch (req.method) {
    case 'GET':
      // Fetch all schedules for the user
      try {
        const schedules = await prisma.schedule.findMany({
          where: {
            userId: userId,
          },
          include: {
            keyword: true,
          },
        });
        res.status(200).json(schedules);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Error fetching schedules' });
      }
      break;

    case 'POST':
      // Add a new schedule
      const { keywordId, frequency, emails } = req.body;

      if (!keywordId || !frequency || !emails) {
        return res.status(400).json({ error: 'Invalid input' });
      }

      try {
        // Check if a schedule already exists for this keyword for the user
        const existingSchedule = await prisma.schedule.findFirst({
          where: {
            keywordId: Number(keywordId),
            userId: userId,
          },
        });

        if (existingSchedule) {
          return res
            .status(400)
            .json({ error: 'A schedule already exists for the selected keyword' });
        }

        // Create the new schedule
        const newSchedule = await prisma.schedule.create({
          data: {
            keywordId: Number(keywordId),
            frequency,
            emails,
            userId,
          },
        });

        res.status(201).json(newSchedule);
      } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ error: 'Error creating schedule' });
      }
      break;

    case 'PUT':
      // Update an existing schedule
      const { id, newFrequency, newEmails } = req.body;

      if (!id || !newFrequency || !newEmails) {
        return res.status(400).json({ error: 'Invalid input for updating schedule' });
      }

      try {
        const updatedSchedule = await prisma.schedule.update({
          where: {
            id: Number(id),
          },
          data: {
            frequency: newFrequency,
            emails: newEmails,
          },
        });

        res.status(200).json(updatedSchedule);
      } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ error: 'Error updating schedule' });
      }
      break;

    case 'DELETE':
      // Delete an existing schedule
      const { scheduleId } = req.body;

      if (!scheduleId) {
        return res.status(400).json({ error: 'Schedule ID is required for deletion' });
      }

      try {
        await prisma.schedule.delete({
          where: {
            id: Number(scheduleId),
          },
        });

        res.status(200).json({ message: 'Schedule deleted successfully' });
      } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ error: 'Error deleting schedule' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
