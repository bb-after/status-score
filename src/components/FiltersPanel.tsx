import { Box, Heading, Select, FormControl, FormLabel } from "@chakra-ui/react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file

interface FiltersPanelProps {
  selectedDataSource: string;
  setSelectedDataSource: React.Dispatch<React.SetStateAction<string>>;
  selectedSentiment: string;
  setSelectedSentiment: React.Dispatch<React.SetStateAction<string>>;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  setDateRange: React.Dispatch<
    React.SetStateAction<{
      startDate: Date;
      endDate: Date;
    }>
  >;
  reports: any[];
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  selectedDataSource,
  setSelectedDataSource,
  selectedSentiment,
  setSelectedSentiment,
  dateRange,
  setDateRange,
  reports,
}) => {
  return (
    <Box mt={10} mb={6} display="flex" flexDirection="column">
      <Heading as="h3" size="md" mb={4}>
        Filter Data Source Analysis
      </Heading>

      {/* Data Source Filter */}
      <FormControl mb={4}>
        <FormLabel>Data Source</FormLabel>
        <Select
          value={selectedDataSource}
          onChange={(e) => setSelectedDataSource(e.target.value)}
        >
          <option value="ALL">All Data Sources</option>
          {Array.from(
            new Set(
              reports.flatMap((report) =>
                report.dataSourceResults.map(
                  (result) => result.dataSource?.name
                )
              )
            )
          ).map(
            (dataSourceName, index) =>
              dataSourceName && (
                <option key={index} value={dataSourceName}>
                  {dataSourceName}
                </option>
              )
          )}
        </Select>
      </FormControl>

      {/* Sentiment Filter */}
      <FormControl mb={4}>
        <FormLabel>Sentiment</FormLabel>
        <Select
          value={selectedSentiment}
          onChange={(e) => setSelectedSentiment(e.target.value)}
        >
          <option value="ALL">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </Select>
      </FormControl>

      {/* Date Range Filter */}
      <FormControl mb={4}>
        <FormLabel>Date Range</FormLabel>
        <DateRangePicker
          ranges={[
            {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
              key: "selection",
            },
          ]}
          onChange={(ranges) =>
            setDateRange({
              startDate: ranges.selection.startDate,
              endDate: ranges.selection.endDate,
            })
          }
          rangeColors={["#3f51b5"]}
        />
      </FormControl>
    </Box>
  );
};

export default FiltersPanel;
