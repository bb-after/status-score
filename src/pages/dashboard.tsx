import { useState, useEffect } from "react";
import axios from "axios";
import KeywordDropdown from "../components/KeywordDropdown";
import FiltersPanel from "../components/FiltersPanel";
import ReportsTable from "../components/ReportsTable";
import {
  Box,
  Heading,
  useColorModeValue,
  VStack,
  Text,
  Button,
} from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Layout from "../components/Layout";
import NextLink from "next/link";

// Registering the necessary components and scales for Chart.js
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(
    null
  );
  const [selectedKeywordName, setSelectedKeywordName] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState<string>("ALL");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [hasKeywords, setHasKeywords] = useState(true);

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  const aquamarineColors = {
    4: "#00f8ba",
    300: "#00e5aa",
    500: "#00d299",
    700: "#00bf88",
  };

  useEffect(() => {
    checkForKeywords();
  }, []);

  useEffect(() => {
    if (selectedKeywordId) {
      fetchReports(selectedKeywordId);
    }
  }, [selectedKeywordId]);

  useEffect(() => {
    if (reports.length > 0) {
      const dates = reports.map((report) => new Date(report.createdAt));
      const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

      setDateRange({ startDate: earliestDate, endDate: latestDate });
      applyFilters();
    }
  }, [reports]);

  useEffect(() => {
    applyFilters();
  }, [selectedDataSource, selectedSentiment, dateRange]);

  const checkForKeywords = async () => {
    try {
      const response = await axios.get("/api/keywords");
      setHasKeywords(response.data.length > 0);
    } catch (error) {
      console.error("Error checking for keywords:", error);
      setError("Failed to check for keywords. Please try again.");
    }
  };

  const fetchReports = async (keywordId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/reports/${keywordId}`);
      console.log("hi....", response.data);
      setReports(response.data);
      setFilteredReports(response.data); // Set the initial filtered reports to all reports
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError("Failed to fetch reports. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    console.log("Starting applyFilters. Initial reports:", reports);

    const filtered = reports.map((report) => {
      console.log(`Processing report ${report.id}:`, report);

      // If dataSourceResults is null or undefined, keep the entire report
      if (!report.dataSourceResults) {
        console.log(
          `Report ${report.id} has no dataSourceResults. Keeping entire report.`
        );
        return report;
      }

      // Filter `dataSourceResults` within each `report` to match selected criteria
      const filteredResults = report.dataSourceResults.filter((result) => {
        const matchesDataSource =
          selectedDataSource === "ALL" ||
          result.dataSource?.name === selectedDataSource;
        const matchesSentiment =
          selectedSentiment === "ALL" || result.sentiment === selectedSentiment;
        const reportDate = new Date(report.createdAt);
        const matchesDateRange =
          reportDate >= dateRange.startDate && reportDate <= dateRange.endDate;

        console.log(`Result for report ${report.id}:`, {
          matchesDataSource,
          matchesSentiment,
          matchesDateRange,
          dataSource: result.dataSource?.name,
          sentiment: result.sentiment,
          reportDate,
          dateRange,
        });

        return matchesDataSource && matchesSentiment && matchesDateRange;
      });

      console.log(`Filtered results for report ${report.id}:`, filteredResults);

      return {
        ...report,
        dataSourceResults: filteredResults,
      };
    });
    // .filter((report) => {
    //   const keepReport =
    //     !report.dataSourceResults || report.dataSourceResults.length > 0;
    //   console.log(`Keeping report ${report.id}:`, keepReport);
    //   return keepReport;
    // });

    console.log("Final filtered reports:", filtered);

    setFilteredReports(filtered);
  };

  const chartData = {
    labels: reports.map((report) =>
      new Date(report.createdAt).toLocaleDateString()
    ),
    datasets: [
      {
        label: `Sentiment Analysis for Keyword: ${selectedKeywordName}`,
        data: reports.map((report) => {
          switch (report.sentiment) {
            case "positive":
              return 3;
            case "neutral":
              return 2;
            case "negative":
              return 1;
            default:
              return 0;
          }
        }),
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const report = reports[index];
            const score = report.sentiment;
            return [
              `Score: ${score}`,
              `Summary: ${report.payload?.summary || "No summary available"}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            switch (value) {
              case 3:
                return "Positive";
              case 2:
                return "Neutral";
              case 1:
                return "Negative";
              default:
                return "";
            }
          },
        },
      },
    },
  };

  const handleKeywordSelection = (keywordId: number, keywordName: string) => {
    setSelectedKeywordId(keywordId);
    setSelectedKeywordName(keywordName);
  };

  if (!hasKeywords) {
    return (
      <Layout>
        <Box maxW="6xl" mx="auto" py="12" px="6" bg={bgColor} color={textColor}>
          <VStack spacing={8} align="center">
            <Heading as="h2" size="xl" textAlign="center">
              Welcome to Your Dashboard
            </Heading>
            <Text fontSize="lg" textAlign="center">
              It looks like you haven&apos;t added any keywords yet. Let&apos;s
              get started by adding your first keyword!
            </Text>
            <Button
              as={NextLink}
              href="/add-keyword"
              size="lg"
              bg={aquamarineColors[4]}
              color="gray.900"
              _hover={{ bg: aquamarineColors[300] }}
            >
              Add Your First Keyword
            </Button>
          </VStack>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box maxW="6xl" mx="auto" py="12" px="6" bg={bgColor} color={textColor}>
        <Heading as="h2" size="xl" textAlign="center" mb={6}>
          Dashboard
        </Heading>

        <KeywordDropdown onSelectKeyword={handleKeywordSelection} />

        {selectedKeywordId && (
          <Box mt={6}>
            <Heading as="h2" size="lg">
              Reports for &quot;{selectedKeywordName}&quot;
            </Heading>

            {isLoading ? (
              <Box mt={4}>Loading...</Box>
            ) : error ? (
              <Box mt={4} color="red.500">
                {error}
              </Box>
            ) : (
              <>
                {filteredReports.length > 0 ? (
                  <Box mt={8}>
                    <Line data={chartData} options={chartOptions} />

                    <FiltersPanel
                      selectedDataSource={selectedDataSource}
                      setSelectedDataSource={setSelectedDataSource}
                      selectedSentiment={selectedSentiment}
                      setSelectedSentiment={setSelectedSentiment}
                      dateRange={dateRange}
                      setDateRange={setDateRange}
                      reports={reports}
                    />

                    <ReportsTable filteredReports={filteredReports} />
                  </Box>
                ) : (
                  <Box mt={8}>
                    <p>
                      No reports available for the selected keyword. Please
                      select a different keyword.
                    </p>
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default Dashboard;
