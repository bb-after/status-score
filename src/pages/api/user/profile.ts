import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUserId } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getAuthenticatedUserId(req, res);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, avatar: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const form = new IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(500).json({ error: 'Error parsing form data' });
        }

        const name = fields.name as string;
        const avatarFile = files.avatar as any;

        let avatarUrl = '';

        if (avatarFile) {
          const fileExtension = path.extname(avatarFile.originalFilename);
          const newFilename = `${userId}-${Date.now()}${fileExtension}`;
          const newPath = path.join(process.cwd(), 'public', 'uploads', newFilename);

          await fs.mkdir(path.dirname(newPath), { recursive: true });
          await fs.copyFile(avatarFile.filepath, newPath);
          avatarUrl = `/uploads/${newFilename}`;
        }

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            name,
            ...(avatarUrl && { avatar: avatarUrl }),
          },
          select: { name: true, avatar: true },
        });

        return res.status(200).json(updatedUser);
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

