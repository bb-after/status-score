import { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import KeywordDropdown from "../components/KeywordDropdown";
import { Box, Heading, Button, Text, VStack } from "@chakra-ui/react";
import Loader from "../components/Loader";

const KeywordAnalysisPage = () => {
  const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(
    null
  );
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [overallSentiment, setOverallSentiment] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeywordSelection = (keywordId: number) => {
    setSelectedKeywordId(keywordId);
    setAnalysisResults([]);
    setOverallSentiment(null);
    setError(null);
  };

  const runAnalysis = async () => {
    if (!selectedKeywordId) {
      setError("Please select a keyword.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/reports/all", {
        keywordId: selectedKeywordId,
      });

      const { overallSentiment, analysisResults } = response.data;
      setOverallSentiment(overallSentiment);
      setAnalysisResults(analysisResults);
    } catch (err) {
      setError("Failed to run analysis. Please try again.");
      console.error("Error running analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box maxW="2xl" mx="auto" py="12" px="6">
        <Heading as="h2" size="xl" textAlign="center" mb={6}>
          Keyword Analysis
        </Heading>

        <KeywordDropdown onSelectKeyword={handleKeywordSelection} />

        <Button
          mt={4}
          colorScheme="teal"
          onClick={runAnalysis}
          isDisabled={!selectedKeywordId}
        >
          Run Analysis for All Sources
        </Button>

        {/* Loading Spinner */}
        {loading && <Loader />}

        {/* Error Message */}
        {error && (
          <Box mt={4} textAlign="center">
            <Text color="red.500">{error}</Text>
          </Box>
        )}

        {/* Analysis Results */}
        {overallSentiment && (
          <Box mt={8}>
            <Heading as="h3" size="lg" mb={4}>
              Overall Sentiment: {overallSentiment}
            </Heading>
            <VStack spacing={4} align="stretch">
              {analysisResults.map((result, index) => (
                <Box key={index} p={4} borderWidth="1px" borderRadius="lg">
                  <Text fontWeight="bold">Source: {result.source}</Text>
                  <Text>Sentiment: {result.sentiment}</Text>
                  <Text>Score: {result.score}</Text>
                  <Text mt={2}>Response: {result.response}</Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default KeywordAnalysisPage;
