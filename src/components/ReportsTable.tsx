import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Heading,
} from "@chakra-ui/react";

interface ReportsTableProps {
  filteredReports: any[];
}

const ReportsTable: React.FC<ReportsTableProps> = ({ filteredReports }) => {
  const getSentimentColor = (sentiment: string) => {
    if (sentiment.toLowerCase().includes("positive")) {
      return "green.50";
    } else if (sentiment.toLowerCase().includes("negative")) {
      return "red.50";
    }
    return "gray.50";
  };

  return (
    <Box mt={10}>
      <Heading as="h3" size="md" mb={4}>
        Detailed Data Source Analysis
      </Heading>
      <Table>
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Data Source</Th>
            <Th>Sentiment</Th>
            <Th>Response</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredReports.map((report) =>
            report.dataSourceResults.map((result) => (
              <Tr
                key={`${report.id}-${result.id}`}
                bg={getSentimentColor(result.sentiment)}
              >
                <Td>{new Date(report.createdAt).toLocaleDateString()}</Td>
                <Td>{result.dataSource?.name || "Unknown"}</Td>
                <Td>{result.sentiment}</Td>
                <Td>{result.response}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ReportsTable;
