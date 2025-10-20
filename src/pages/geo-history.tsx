import { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  Heading,
  Divider,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { ViewIcon, TimeIcon, RepeatIcon } from "@chakra-ui/icons";
import { formatDistanceToNow } from "date-fns";
import { ProtectedRoute } from "../components/ProtectedRoute";

interface GeoSearchRecord {
  id: number;
  keyword: string;
  analysisType: string;
  intentCategory: string;
  overallSentiment: string | null;
  results: any[];
  aggregatedInsights: any;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface HistoryResponse {
  searches: GeoSearchRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function GeoHistory() {
  const { user, isLoading: authLoading } = useUser();
  const [history, setHistory] = useState<GeoSearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSearch, setSelectedSearch] = useState<GeoSearchRecord | null>(
    null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (user?.isAuthenticated && !authLoading) {
      fetchHistory();
    }
  }, [user, authLoading]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/geo/history");

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data: HistoryResponse = await response.json();
      setHistory(data.searches);
    } catch (error) {
      console.error("Failed to fetch GEO history:", error);
      setError("Failed to load your GEO analysis history");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (search: GeoSearchRecord) => {
    setSelectedSearch(search);
    onOpen();
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "green";
      case "negative":
        return "red";
      case "neutral":
        return "gray";
      default:
        return "blue";
    }
  };

  const getAnalysisTypeColor = (type: string) => {
    return type === "brand" ? "purple" : "teal";
  };

  return (
    <ProtectedRoute
      title="Sign in to view your GEO history"
      description="Please sign in to view your previous GEO analysis results."
      loadingMessage="Loading your GEO history..."
    >
      <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Heading size="xl" color="gray.900">
                GEO Analysis History
              </Heading>
              <Text color="gray.600">
                Review your previous GEO (Generative Engine Optimization)
                analyses
              </Text>
            </VStack>
            <Button
              leftIcon={<RepeatIcon />}
              onClick={fetchHistory}
              variant="outline"
              colorScheme="teal"
            >
              Refresh
            </Button>
          </HStack>
          <Divider />
        </Box>

        {/* Loading State */}
        {loading && (
          <VStack spacing={4} py={12}>
            <Spinner size="lg" color="teal.500" />
            <Text>Loading your GEO analysis history...</Text>
          </VStack>
        )}

        {/* Error State */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && !error && history.length === 0 && (
          <VStack spacing={6} py={12} textAlign="center">
            <Box fontSize="4xl" color="gray.300">
              📊
            </Box>
            <VStack spacing={2}>
              <Text fontSize="xl" fontWeight="semibold" color="gray.700">
                No GEO analyses yet
              </Text>
              <Text color="gray.600">
                Run your first GEO analysis to see results here
              </Text>
            </VStack>
            <Button as="a" href="/geo-check" colorScheme="teal" size="lg">
              Run GEO Analysis
            </Button>
          </VStack>
        )}

        {/* History List */}
        {!loading && !error && history.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {history.map((search) => (
              <Card key={search.id} variant="outline" _hover={{ shadow: "md" }}>
                <CardHeader pb={3}>
                  <VStack align="start" spacing={2}>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                        {search.keyword}
                      </Text>
                      <Badge
                        colorScheme={getAnalysisTypeColor(search.analysisType)}
                        variant="subtle"
                        textTransform="capitalize"
                      >
                        {search.analysisType}
                      </Badge>
                    </HStack>

                    <HStack spacing={2} wrap="wrap">
                      {search.overallSentiment && (
                        <Badge
                          colorScheme={getSentimentColor(
                            search.overallSentiment
                          )}
                          variant="subtle"
                          fontSize="xs"
                        >
                          {search.overallSentiment}
                        </Badge>
                      )}
                      <Badge variant="outline" fontSize="xs">
                        {search.intentCategory.replace(/_/g, " ")}
                      </Badge>
                    </HStack>
                  </VStack>
                </CardHeader>

                <CardBody pt={0}>
                  <VStack align="start" spacing={3}>
                    <HStack color="gray.600" fontSize="sm">
                      <TimeIcon />
                      <Text>
                        {formatDistanceToNow(new Date(search.createdAt), {
                          addSuffix: true,
                        })}
                      </Text>
                    </HStack>

                    {search.results && (
                      <Text fontSize="sm" color="gray.600">
                        {search.results.length} AI engine response
                        {search.results.length !== 1 ? "s" : ""}
                      </Text>
                    )}

                    <Flex justify="space-between" align="center" w="full">
                      <Button
                        size="sm"
                        leftIcon={<ViewIcon />}
                        colorScheme="teal"
                        variant="outline"
                        onClick={() => handleViewDetails(search)}
                      >
                        View Details
                      </Button>
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Details Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="6xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <Text>GEO Analysis Details</Text>
              {selectedSearch && (
                <HStack spacing={3}>
                  <Badge
                    colorScheme={getAnalysisTypeColor(
                      selectedSearch.analysisType
                    )}
                  >
                    {selectedSearch.analysisType}
                  </Badge>
                  <Text fontSize="lg" fontWeight="normal">
                    &quot;{selectedSearch.keyword}&quot;
                  </Text>
                </HStack>
              )}
            </VStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {selectedSearch && (
              <VStack spacing={6} align="stretch">
                {/* Analysis Overview */}
                <Card variant="outline">
                  <CardHeader>
                    <Text fontWeight="semibold">Analysis Overview</Text>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Keyword
                        </Text>
                        <Text fontWeight="medium">
                          {selectedSearch.keyword}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Analysis Type
                        </Text>
                        <Badge
                          colorScheme={getAnalysisTypeColor(
                            selectedSearch.analysisType
                          )}
                        >
                          {selectedSearch.analysisType}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Intent Category
                        </Text>
                        <Text textTransform="capitalize">
                          {selectedSearch.intentCategory.replace(/_/g, " ")}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={1}>
                          Overall Sentiment
                        </Text>
                        {selectedSearch.overallSentiment ? (
                          <Badge
                            colorScheme={getSentimentColor(
                              selectedSearch.overallSentiment
                            )}
                          >
                            {selectedSearch.overallSentiment}
                          </Badge>
                        ) : (
                          <Text color="gray.500">N/A</Text>
                        )}
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* AI Engine Results */}
                {selectedSearch.results &&
                  selectedSearch.results.length > 0 && (
                    <Card variant="outline">
                      <CardHeader>
                        <Text fontWeight="semibold">
                          AI Engine Results ({selectedSearch.results.length})
                        </Text>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          {selectedSearch.results.map(
                            (result: any, index: number) => (
                              <Box
                                key={index}
                                p={4}
                                bg="gray.50"
                                rounded="md"
                                border="1px"
                                borderColor="gray.200"
                              >
                                <VStack align="stretch" spacing={3}>
                                  <HStack justify="space-between">
                                    <Badge
                                      colorScheme="purple"
                                      variant="subtle"
                                    >
                                      {result.engine || `Engine ${index + 1}`}
                                    </Badge>
                                    {result.error && (
                                      <Badge
                                        colorScheme="red"
                                        variant="outline"
                                      >
                                        Error
                                      </Badge>
                                    )}
                                  </HStack>

                                  {result.error ? (
                                    <Text fontSize="sm" color="red.600">
                                      {result.error}
                                    </Text>
                                  ) : (
                                    <Text
                                      fontSize="sm"
                                      color="gray.700"
                                      whiteSpace="pre-wrap"
                                    >
                                      {result.summary ||
                                        result.response ||
                                        "No response content"}
                                    </Text>
                                  )}

                                  {result.sources &&
                                    result.sources.length > 0 && (
                                      <Box>
                                        <Text
                                          fontSize="xs"
                                          fontWeight="medium"
                                          color="gray.600"
                                          mb={1}
                                        >
                                          Sources ({result.sources.length}):
                                        </Text>
                                        <VStack spacing={1} align="start">
                                          {result.sources
                                            .slice(0, 3)
                                            .map(
                                              (
                                                source: any,
                                                sourceIndex: number
                                              ) => (
                                                <Text
                                                  key={sourceIndex}
                                                  fontSize="xs"
                                                  color="blue.600"
                                                >
                                                  •{" "}
                                                  {typeof source === "string"
                                                    ? source
                                                    : source.url ||
                                                      source.title ||
                                                      "Source"}
                                                </Text>
                                              )
                                            )}
                                          {result.sources.length > 3 && (
                                            <Text
                                              fontSize="xs"
                                              color="gray.500"
                                            >
                                              ...and {result.sources.length - 3}{" "}
                                              more sources
                                            </Text>
                                          )}
                                        </VStack>
                                      </Box>
                                    )}
                                </VStack>
                              </Box>
                            )
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  )}

                {/* Aggregated Insights */}
                {selectedSearch.aggregatedInsights && (
                  <Card variant="outline">
                    <CardHeader>
                      <Text fontWeight="semibold">Aggregated Insights</Text>
                    </CardHeader>
                    <CardBody>
                      <Box
                        p={4}
                        bg="blue.50"
                        rounded="md"
                        border="1px"
                        borderColor="blue.200"
                        maxH="300px"
                        overflowY="auto"
                      >
                        <Text
                          fontSize="xs"
                          fontFamily="mono"
                          whiteSpace="pre-wrap"
                          color="gray.600"
                        >
                          {JSON.stringify(
                            selectedSearch.aggregatedInsights,
                            null,
                            2
                          )}
                        </Text>
                      </Box>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
    </ProtectedRoute>
  );
}
