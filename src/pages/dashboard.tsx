import { useState, useEffect } from "react";
import axios from "axios";
import KeywordDropdown from "../components/KeywordDropdown";
import Loader from "../components/Loader"; // Import the loader component
import { Box, Heading, Button, Alert, AlertIcon } from "@chakra-ui/react";
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
  const [selectedKeywordName, setSelectedKeywordName] = useState<string>(""); // State for keyword name
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // State for loading status
  const [error, setError] = useState<string | null>(null); // State for error messages

  useEffect(() => {
    if (selectedKeywordId) {
      fetchReports(selectedKeywordId);
    }
  }, [selectedKeywordId]);

  const fetchReports = async (keywordId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/reports?keywordId=${keywordId}`);
      setReports(response.data);
    } catch (error) {
      console.error("Failed to fetch reports", error);
      setError("Failed to fetch reports. Please try again.");
    } finally {
      setLoading(false);
    }
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
              `Summary: ${report.payload.summary || "No summary available"}`,
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
          callback: function (value: number) {
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

  // This function will be called when the user selects a new keyword from the dropdown
  const handleKeywordSelection = (keywordId: number, keywordName: string) => {
    setSelectedKeywordId(keywordId);
    setSelectedKeywordName(keywordName); // Store the keyword name
  };

  return (
    <Layout>
      <Box maxW="2xl" mx="auto" py="12" px="6">
        <Heading as="h2" size="xl" textAlign="center" mb={6}>
          Dashboard
        </Heading>

        {/* Add the KeywordDropdown here */}
        <KeywordDropdown onSelectKeyword={handleKeywordSelection} />

        {/* Display Loader if loading */}
        {loading && <Loader />}

        {/* Show error if it exists */}
        {error && (
          <Alert status="error" mt={6}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Show selected keyword reports */}
        {selectedKeywordId && !loading && !error && (
          <Box mt={6}>
            <Heading as="h2" size="lg">
              Reports for &quot;{selectedKeywordName}&quot;
            </Heading>

            {reports.length > 0 ? (
              <Box mt={8}>
                <Line data={chartData} options={chartOptions} />
              </Box>
            ) : (
              <Box mt={8}>
                <p>
                  No reports available for the selected keyword. Please select a
                  different keyword.
                </p>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default Dashboard;
