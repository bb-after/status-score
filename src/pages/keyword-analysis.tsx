import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import dynamic from "next/dynamic";

const KeywordDropdown = dynamic(() => import("../components/KeywordDropdown"), {
  ssr: false,
});

import {
  Box,
  Heading,
  Button,
  Text,
  VStack,
  RadioGroup,
  Stack,
  Radio,
  Checkbox,
  CheckboxGroup,
  Container,
  Spinner,
} from "@chakra-ui/react";
import Loader from "../components/Loader";
import { useAuth } from "../contexts/AuthContext";

const KeywordAnalysisPage = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(
    null
  );
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [overallSentiment, setOverallSentiment] = useState<
    string | number | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [dataSources, setDataSources] = useState<any[]>([]); // Holds the list of data sources
  const [sourceSelectionMode, setSourceSelectionMode] = useState<string>("all"); // "all" or "specific"
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch available data sources
    const fetchDataSources = async () => {
      try {
        const response = await axios.get("/api/datasources");
        const activeDataSources = response.data.filter(
          (source: any) => source.active
        );
        setDataSources(activeDataSources);
        setSelectedSources(
          activeDataSources.map((source: any) => source.id.toString())
        ); // Initialize with all sources selected
      } catch (error) {
        console.error("Failed to fetch data sources", error);
      }
    };
    fetchDataSources();
  }, []);

  useEffect(() => {
    const { keywordId } = router.query;
    if (keywordId && typeof keywordId === "string") {
      const parsedKeywordId = parseInt(keywordId, 10);
      if (!isNaN(parsedKeywordId)) {
        setSelectedKeywordId(parsedKeywordId);
      }
    }
  }, [router.query]);

  const handleKeywordSelection = useCallback(
    (keywordId: number, name: string) => {
      setSelectedKeywordId(keywordId);
      setAnalysisResults([]);
      setOverallSentiment(null);
      setError(null);
    },
    []
  ); // Empty dependency array since it doesn't depend on any values

  if (!mounted) {
    return null; // or a loading spinner
  }

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
        dataSourceIds: sourceSelectionMode === "all" ? [] : selectedSources,
      });
      debugger;
      const { overallSentiment, analysisResults } = response.data;
      setOverallSentiment(String(overallSentiment)); // Convert number to string
      setAnalysisResults(analysisResults);
    } catch (err) {
      setError("Failed to run analysis. Please try again.");
      console.error("Error running analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Container maxW="2xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text>Loading...</Text>
        </VStack>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Container maxW="2xl" py={8}>
        <VStack spacing={6} textAlign="center">
          <Heading>Sign in to analyze keywords</Heading>
          <Text color="gray.600">
            Please sign in to perform detailed keyword analysis and view reports.
          </Text>
          <Button as="a" href="/api/auth/login" colorScheme="teal" size="lg">
            Sign In
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Box maxW="2xl" mx="auto" py="12" px="6">
      <Heading as="h2" size="xl" textAlign="center" mb={6}>
        Keyword Analysis
      </Heading>

      {/* Keyword Selection */}
      <KeywordDropdown
        onSelectKeyword={handleKeywordSelection}
        defaultValue={selectedKeywordId}
      />

      {/* Source Selection Mode */}
      <Box mt={4}>
        <Heading as="h4" size="md" mb={4}>
          Select Sources
        </Heading>
        <RadioGroup
          onChange={(value) => setSourceSelectionMode(value)}
          value={sourceSelectionMode}
        >
          <Stack direction="row" spacing={4}>
            <Radio value="all">All Sources</Radio>
            <Radio value="specific">Specific Sources</Radio>
          </Stack>
        </RadioGroup>

        {sourceSelectionMode === "specific" && (
          <Box mt={4}>
            <CheckboxGroup
              value={selectedSources}
              onChange={(values: string[]) => setSelectedSources(values)}
            >
              <Stack direction="column">
                {dataSources.map((source) => (
                  <Checkbox key={source.id} value={source.id.toString()}>
                    {source.name} - {source.model}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          </Box>
        )}
      </Box>

      {/* Run Analysis Button */}
      <Button
        mt={4}
        colorScheme="teal"
        onClick={runAnalysis}
        isDisabled={!selectedKeywordId}
      >
        Run Analysis
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
      {overallSentiment !== null && overallSentiment !== undefined && (
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
                <Text>Magnitude: {result.magnitude}</Text>
                <Box mt={2}>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: result.response.replace(/\n/g, "<br />"),
                    }}
                  />
                </Box>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default dynamic(() => Promise.resolve(KeywordAnalysisPage), {
  ssr: false,
});
