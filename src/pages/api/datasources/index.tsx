import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const dataSources = await prisma.dataSource.findMany();
      res.status(200).json(dataSources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch data sources" });
    }
  } else if (req.method === "POST") {
    const { name, model, prompt, active } = req.body;

    try {
      const newDataSource = await prisma.dataSource.create({
        data: {
          name,
          model,
          prompt,
          active,
        },
      });
      res.status(201).json(newDataSource);
    } catch (error) {
      res.status(500).json({ error: "Failed to create data source" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
