import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { scheduleFrequency } = req.query;
  
  if (!scheduleFrequency) {
    res.status(400).json({ error: "Schedule frequency is required" });
    return;
  }

  console.log(`Simulating Lambda Invocation for ${scheduleFrequency} schedules`);
  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        frequency: scheduleFrequency as string,
      },
    });

    console.log('schedules!', schedules);
    for (let schedule of schedules) {
      try {
        console.log(`Invoking /api/reports/all endpoint for schedule ID ${schedule.id}`);
        const response = await axios.post('http://localhost:3000/api/reports/all', {
          keywordId: schedule.keywordId,
        });
        console.log(`Response for schedule ${schedule.id}:`, response.data);
      } catch (error: any) {
        console.error(`Failed to invoke endpoint for schedule ${schedule.id}:`, error.message);
      }
    }

    res.status(200).json({ message: 'Lambda invocation simulated successfully' });
  } catch (error: any) {
    console.error(`Error fetching schedules for ${scheduleFrequency}:`, error.message);
    res.status(500).json({ error: error.message });
  }
}
