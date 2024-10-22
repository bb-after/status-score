import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    // Fetch the data source by ID
    try {
      const dataSource = await prisma.dataSource.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!dataSource) {
        return res.status(404).json({ error: "Data source not found" });
      }

      res.status(200).json(dataSource);
    } catch (error) {
      console.error("Failed to fetch data source", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    // Update the data source by ID
    const { name, model, prompt, active, weight } = req.body;

    try {
      const updatedDataSource = await prisma.dataSource.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          model,
          prompt,
          active,
          weight,
        },
      });

      res.status(200).json(updatedDataSource);
    } catch (error) {
      console.error("Failed to update data source", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
