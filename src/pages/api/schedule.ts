import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import sendEmail from '../../utils/sendEmail';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { frequency, mock = false } = req.body;
  const scheduleFrequency = frequency || "daily";

  try {
    // Step 1: Get all schedules that match the frequency from the database
    const schedules = await prisma.schedule.findMany({
      where: { frequency: scheduleFrequency },
      include: { keyword: true } // Include keyword for email reference
    });

    // Step 2: Process each schedule
    for (let schedule of schedules) {
      // Step 2.1: Track the run in the ScheduledRun table
      const scheduledRun = await prisma.scheduledRun.create({
        data: {
          scheduleId: schedule.id,
          status: 'in-progress',
          runAt: new Date(),
        },
      });
      const scheduledRunId = scheduledRun.id;

      try {
        let response;
        if (mock) {
          // Mock the AI response if mock mode is enabled
          response = { status: 200, data: { result: "Mocked AI response for testing purposes" } };
          console.log(`Mock response for schedule ${schedule.id}:`, response.data);
        } else {
          // Real API call to generate the report
          response = await axios.post(`${process.env.APPLICATION_BASE_URL}/api/reports/all`, {
            keywordId: schedule.keywordId,
            dataSourceIds: []
          });
          console.log(`Triggered report for schedule: ${schedule.id}, response: ${response.status}`);
        }

        // Update scheduled run status as 'success' and set finishedAt timestamp
        await prisma.scheduledRun.update({
          where: { id: scheduledRunId },
          data: {
            status: 'success',
            finishedAt: new Date(),
          },
        });

        // Construct the link to the report on the dashboard
        const dashboardLink = `${process.env.APPLICATION_BASE_URL}/dashboard/report/${scheduledRunId}`;

        // Send an email notification with keyword and dashboard link
        await sendEmail({
          to: schedule.emails,
          subject: 'Scheduled Report Notification',
          text: `Hello, the scheduled report for the keyword "${schedule.keyword.name}" has been successfully generated. You can view the report here: ${dashboardLink}`
        });

      } catch (err: any) {
        console.error(`Error triggering report for schedule ${schedule.id}:`, err.message);

        // Update scheduled run status as 'failure' and record the error message
        await prisma.scheduledRun.update({
          where: { id: scheduledRunId },
          data: {
            status: 'failure',
            errorMessage: err.message,
            finishedAt: new Date(), // Log when the failure occurred
          },
        });
      }
    }

    res.status(200).json({ message: 'Schedules processed successfully' });
  } catch (error: any) {
    console.error('Error executing schedule processing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
