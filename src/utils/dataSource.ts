import prisma from '../lib/prisma'; // Adjust the path as necessary
import { Prisma } from '@prisma/client';

/**
 * Utility function to get a data source by ID.
 * @param dataSourceId - The ID of the data source to retrieve, which may be in string form.
 * @returns The data source with the specified ID.
 */
export async function getDataSourceById(dataSourceId: number): Promise<Prisma.DataSourceGetPayload<{}>> {
  // Convert the dataSourceId to a number
  const numericDataSourceId = Number(dataSourceId);
  
  if (isNaN(numericDataSourceId)) {
    throw new Error("Invalid dataSourceId. Expected a numeric value.");
  }

  // Fetch the data source from the database
  const dataSource = await prisma.dataSource.findUnique({
    where: {
      id: numericDataSourceId,
    },
  }) as Prisma.DataSourceGetPayload<{}> | null;

  if (!dataSource) {
    throw new Error('Data source not found');
  }

  return dataSource;
}
