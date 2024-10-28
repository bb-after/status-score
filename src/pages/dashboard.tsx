import { useState, useEffect } from "react";
import axios from "axios";
import KeywordDropdown from "../components/KeywordDropdown";
import FiltersPanel from "../components/FiltersPanel";
import ReportsTable from "../components/ReportsTable";
import { Box, Heading } from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import useAuthenticatedUser from "../hooks/useAuthenticatedUser";

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
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";

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
  const [selectedKeywordName, setSelectedKeywordName] = useState(""); // State for keyword name
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
    startDate: new Date(), // Defaults to today until data is fetched
    endDate: new Date(), // Defaults to today until data is fetched
  });

  const { user, isAuthLoading } = useAuthenticatedUser();

  // const router = useRouter();

  // useEffect(() => {
  //   if (!isAuthLoading && !user) {
  //     router.push("/");
  //   }
  // }, [user, isAuthLoading, router]);

  // Return null to prevent rendering the page if the user is not authenticated.
  // if (!user) {
  //   return null;
  // }

  useEffect(() => {
    if (selectedKeywordId) {
      fetchReports(selectedKeywordId);
    }
  }, [selectedKeywordId]);

  useEffect(() => {
    if (reports.length > 0) {
      // Update the date range based on report dates to avoid showing unrealistic defaults
      const dates = reports.map((report) => new Date(report.createdAt));
      const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

      setDateRange({ startDate: earliestDate, endDate: latestDate });

      // Apply filters initially based on the full date range
      applyFilters();
    }
  }, [reports]);

  useEffect(() => {
    // Automatically apply filters whenever filter values change
    applyFilters();
  }, [selectedDataSource, selectedSentiment, dateRange]);

  // If the authentication status is still loading, display a loader
  if (isAuthLoading) {
    return (
      <Layout>
        <Box maxW="6xl" mx="auto" py="12" px="6">
          <Heading as="h2" size="xl" textAlign="center" mb={6}>
            Loading...
          </Heading>
        </Box>
      </Layout>
    );
  }

  const fetchReports = async (keywordId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/reports?keywordId=${keywordId}`);
      setReports(response.data);
      setFilteredReports(response.data); // Set the initial filtered reports to all reports
    } catch (error) {
      console.error("Failed to fetch reports", error);
      setError("Failed to fetch reports. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = reports
      .map((report) => {
        // Filter `dataSourceResults` within each `report` to match selected criteria
        const filteredResults = report.dataSourceResults.filter((result) => {
          const matchesDataSource =
            selectedDataSource === "ALL" ||
            result.dataSource?.name === selectedDataSource;

          const matchesSentiment =
            selectedSentiment === "ALL" ||
            result.sentiment === selectedSentiment;

          const reportDate = new Date(report.createdAt);
          const matchesDateRange =
            reportDate >= dateRange.startDate &&
            reportDate <= dateRange.endDate;

          return matchesDataSource && matchesSentiment && matchesDateRange;
        });

        return {
          ...report,
          dataSourceResults: filteredResults,
        };
      })
      .filter((report) => report.dataSourceResults.length > 0);

    setFilteredReports(filtered);
  };

  // Prepare data for the chart
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

  return (
    <Layout>
      <Box maxW="6xl" mx="auto" py="12" px="6">
        <Heading as="h2" size="xl" textAlign="center" mb={6}>
          Dashboard
        </Heading>

        {/* Add the KeywordDropdown here */}
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
                    {/* Chart showing sentiment trend */}
                    <Line data={chartData} options={chartOptions} />

                    {/* Filters Section */}
                    <FiltersPanel
                      selectedDataSource={selectedDataSource}
                      setSelectedDataSource={setSelectedDataSource}
                      selectedSentiment={selectedSentiment}
                      setSelectedSentiment={setSelectedSentiment}
                      dateRange={dateRange}
                      setDateRange={setDateRange}
                      reports={reports}
                    />

                    {/* Table showing detailed analysis */}
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
