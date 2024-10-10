import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const { name, model, prompt, active } = req.body;

    try {
      const updatedDataSource = await prisma.dataSource.update({
        where: { id: Number(id) },
        data: {
          name,
          model,
          prompt,
          active,
        },
      });
      res.status(200).json(updatedDataSource);
    } catch (error) {
      res.status(500).json({ error: "Failed to update data source" });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.dataSource.delete({
        where: { id: Number(id) },
      });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete data source" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
