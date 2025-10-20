import { useState, useEffect, useCallback } from "react";
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
  Input,
  IconButton,
  Tooltip,
  Collapse,
  Icon,
} from "@chakra-ui/react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  ViewIcon,
  TimeIcon,
  RepeatIcon,
  SearchIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from "@chakra-ui/icons";
import { formatDistanceToNow } from "date-fns";
import { SearchResults } from "../components/reputation/SearchResults";
import { ProtectedRoute } from "../components/ProtectedRoute";

interface ReputationSearchRecord {
  id: number;
  keyword: string;
  entityType: string;
  score: number;
  positiveArticles: number;
  wikipediaPresence: number;
  ownedAssets: number;
  negativeLinks: number;
  socialPresence: number;
  aiOverviews: number;
  geoPresence: number;
  searchResults: any[];
  createdAt: string;
  updatedAt: string;
}

interface HistoryResponse {
  searches: ReputationSearchRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface KeywordGroup {
  keyword: string;
  entityType: string;
  searches: ReputationSearchRecord[];
  latestScore: number;
  latestSearch: ReputationSearchRecord;
  firstScore: number;
  trend: "up" | "down" | "stable";
  totalSearches: number;
}

export default function ReputationHistory() {
  const { user, isLoading: authLoading } = useUser();
  console.log("user", user);
  const [history, setHistory] = useState<ReputationSearchRecord[]>([]);
  const [groupedHistory, setGroupedHistory] = useState<KeywordGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSearch, setSelectedSearch] =
    useState<ReputationSearchRecord | null>(null);
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (user?.isAuthenticated && !authLoading) {
      fetchHistory();
    }
  }, [user, authLoading]);

  const groupSearchesByKeyword = (
    searches: ReputationSearchRecord[]
  ): KeywordGroup[] => {
    const groupMap: Record<string, ReputationSearchRecord[]> = {};

    // Group by keyword
    searches.forEach((search) => {
      const key = search.keyword.toLowerCase();
      if (!groupMap[key]) {
        groupMap[key] = [];
      }
      groupMap[key].push(search);
    });

    // Convert to KeywordGroup array with stats
    return Object.entries(groupMap)
      .map(([keyword, keywordSearches]) => {
        // Sort searches by date (newest first)
        const sortedSearches = keywordSearches.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const latestSearch = sortedSearches[0];
        const firstSearch = sortedSearches[sortedSearches.length - 1];
        const latestScore = latestSearch.score;
        const firstScore = firstSearch.score;

        // Determine trend
        let trend: "up" | "down" | "stable" = "stable";
        if (sortedSearches.length > 1) {
          const scoreDiff = latestScore - firstScore;
          if (scoreDiff > 5) trend = "up";
          else if (scoreDiff < -5) trend = "down";
        }

        return {
          keyword: latestSearch.keyword, // Use original casing
          entityType: latestSearch.entityType,
          searches: sortedSearches,
          latestScore,
          latestSearch,
          firstScore,
          trend,
          totalSearches: sortedSearches.length,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.latestSearch.createdAt).getTime() -
          new Date(a.latestSearch.createdAt).getTime()
      );
  };

  const fetchHistory = useCallback(async (keyword = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (keyword) params.append("keyword", keyword);

      const response = await fetch(`/api/reputation/search-history?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data: HistoryResponse = await response.json();
      setHistory(data.searches);

      // Group searches by keyword
      const groups = groupSearchesByKeyword(data.searches);
      setGroupedHistory(groups);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load search history");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    fetchHistory(searchKeyword);
  };

  const handleViewDetails = (search: ReputationSearchRecord) => {
    setSelectedSearch(search);
    onOpen();
  };

  const toggleKeywordExpansion = (keyword: string) => {
    setExpandedKeyword(expandedKeyword === keyword ? null : keyword);
  };

  const getEntityTypeBadgeColor = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case "individual":
        return "blue";
      case "company":
        return "green";
      case "public-figure":
        return "purple";
      default:
        return "gray";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "green";
    if (score >= 40) return "yellow";
    return "red";
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return ArrowUpIcon;
      case "down":
        return ArrowDownIcon;
      default:
        return MinusIcon;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "green.500";
      case "down":
        return "red.500";
      default:
        return "gray.500";
    }
  };

  return (
    <ProtectedRoute
      title="Sign in to view reputation history"
      description="Please sign in to view your previous reputation analysis searches and track your progress over time."
      loadingMessage="Loading your reputation history..."
    >
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="stretch">
            <Heading size="lg" color="gray.900">
              Reputation Search History
            </Heading>
            <Text color="gray.600">
              View and manage your previous reputation analysis searches
            </Text>

            {/* Search Filter */}
            <HStack spacing={2}>
              <Input
                placeholder="Search by keyword..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                maxW="400px"
              />
              <Tooltip label="Search history">
                <IconButton
                  aria-label="Search"
                  icon={<SearchIcon />}
                  onClick={handleSearch}
                  colorScheme="teal"
                />
              </Tooltip>
              <Button
                onClick={() => {
                  setSearchKeyword("");
                  fetchHistory();
                }}
                variant="outline"
              >
                Clear
              </Button>
            </HStack>
          </VStack>

          <Divider />

          {/* Content */}
          {loading ? (
            <VStack spacing={4} py={8}>
              <Spinner size="lg" color="teal.500" />
              <Text color="gray.600">Loading your search history...</Text>
            </VStack>
          ) : error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : groupedHistory.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              No reputation searches found. Start by running your first
              analysis!
            </Alert>
          ) : (
            <VStack spacing={4} align="stretch">
              {groupedHistory.map((group) => {
                const TrendIcon = getTrendIcon(group.trend);
                const isExpanded = expandedKeyword === group.keyword;

                return (
                  <Card key={group.keyword} shadow="sm" borderWidth="1px">
                    <CardHeader>
                      <HStack justify="space-between" align="center">
                        <HStack spacing={3} flex={1}>
                          <IconButton
                            aria-label="Toggle expansion"
                            icon={
                              isExpanded ? (
                                <ChevronDownIcon />
                              ) : (
                                <ChevronRightIcon />
                              )
                            }
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              toggleKeywordExpansion(group.keyword)
                            }
                          />
                          <VStack align="start" spacing={1}>
                            <HStack spacing={3}>
                              <Text fontWeight="bold" fontSize="xl">
                                {group.keyword}
                              </Text>
                              <Badge
                                colorScheme={getEntityTypeBadgeColor(
                                  group.entityType
                                )}
                                size="sm"
                              >
                                {group.entityType}
                              </Badge>
                            </HStack>
                            <HStack spacing={4} fontSize="sm" color="gray.600">
                              <HStack spacing={1}>
                                <Icon
                                  as={TrendIcon}
                                  color={getTrendColor(group.trend)}
                                />
                                <Text>
                                  {group.firstScore}→{group.latestScore}
                                  {group.totalSearches > 1 &&
                                    ` (${group.latestScore - group.firstScore > 0 ? "+" : ""}${group.latestScore - group.firstScore})`}
                                </Text>
                              </HStack>
                              <Text>
                                {group.totalSearches} search
                                {group.totalSearches !== 1 ? "es" : ""}
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        <VStack align="end" spacing={1}>
                          <Badge
                            colorScheme={getScoreColor(group.latestScore)}
                            size="lg"
                            px={3}
                            py={1}
                          >
                            Score: {group.latestScore}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            {formatDistanceToNow(
                              new Date(group.latestSearch.createdAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </Text>
                        </VStack>
                      </HStack>
                    </CardHeader>

                    <Collapse in={isExpanded} animateOpacity>
                      <CardBody pt={0}>
                        <VStack spacing={3} align="stretch">
                          <Text fontSize="sm" color="gray.600" mb={2}>
                            All searches for &ldquo;{group.keyword}&rdquo;
                            (newest first):
                          </Text>
                          <SimpleGrid
                            columns={{ base: 1, md: 2, lg: 3 }}
                            spacing={4}
                          >
                            {group.searches.map((search) => (
                              <Box
                                key={search.id}
                                p={4}
                                border="1px"
                                borderColor="gray.200"
                                rounded="lg"
                                bg="gray.50"
                              >
                                <VStack align="stretch" spacing={2}>
                                  <HStack justify="space-between">
                                    <Badge
                                      colorScheme={getScoreColor(search.score)}
                                      size="sm"
                                    >
                                      Score: {search.score}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.500">
                                      {formatDistanceToNow(
                                        new Date(search.createdAt),
                                        {
                                          addSuffix: true,
                                        }
                                      )}
                                    </Text>
                                  </HStack>

                                  <SimpleGrid
                                    columns={2}
                                    spacing={1}
                                    fontSize="xs"
                                  >
                                    <Text color="green.600">
                                      +{search.positiveArticles} Positive
                                    </Text>
                                    <Text color="red.600">
                                      -{search.negativeLinks} Negative
                                    </Text>
                                    <Text color="blue.600">
                                      {search.socialPresence}% Social
                                    </Text>
                                    <Text color="purple.600">
                                      {search.ownedAssets} Owned
                                    </Text>
                                  </SimpleGrid>

                                  <Button
                                    size="xs"
                                    colorScheme="teal"
                                    variant="outline"
                                    leftIcon={<ViewIcon />}
                                    onClick={() => handleViewDetails(search)}
                                  >
                                    View Results
                                  </Button>
                                </VStack>
                              </Box>
                            ))}
                          </SimpleGrid>
                        </VStack>
                      </CardBody>
                    </Collapse>
                  </Card>
                );
              })}
            </VStack>
          )}
        </VStack>

        {/* Details Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="100%">
                  <Text>
                    Search Results for &ldquo;{selectedSearch?.keyword}&rdquo;
                  </Text>
                  <Badge
                    colorScheme={getScoreColor(selectedSearch?.score || 0)}
                    size="lg"
                    px={4}
                    py={2}
                    fontSize="lg"
                  >
                    Score: {selectedSearch?.score}
                  </Badge>
                </HStack>
                <HStack spacing={2}>
                  <Badge
                    colorScheme={getEntityTypeBadgeColor(
                      selectedSearch?.entityType || ""
                    )}
                    size="sm"
                  >
                    {selectedSearch?.entityType}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    {selectedSearch &&
                      formatDistanceToNow(new Date(selectedSearch.createdAt), {
                        addSuffix: true,
                      })}
                  </Text>
                </HStack>

                {/* Score Breakdown */}
                {selectedSearch && (
                  <Box
                    w="100%"
                    p={4}
                    bg="gray.50"
                    rounded="lg"
                    border="1px"
                    borderColor="gray.200"
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      mb={3}
                      color="gray.700"
                    >
                      Score Factors
                    </Text>
                    <SimpleGrid
                      columns={{ base: 2, md: 4 }}
                      spacing={4}
                      fontSize="sm"
                    >
                      <VStack align="center" spacing={1}>
                        <Text fontWeight="medium" color="green.600">
                          +{selectedSearch.positiveArticles}
                        </Text>
                        <Text color="gray.600" textAlign="center">
                          Positive Articles
                        </Text>
                      </VStack>
                      <VStack align="center" spacing={1}>
                        <Text fontWeight="medium" color="red.600">
                          -{selectedSearch.negativeLinks}
                        </Text>
                        <Text color="gray.600" textAlign="center">
                          Negative Links
                        </Text>
                      </VStack>
                      <VStack align="center" spacing={1}>
                        <Text fontWeight="medium" color="blue.600">
                          {selectedSearch.socialPresence}%
                        </Text>
                        <Text color="gray.600" textAlign="center">
                          Social Presence
                        </Text>
                      </VStack>
                      <VStack align="center" spacing={1}>
                        <Text fontWeight="medium" color="purple.600">
                          {selectedSearch.ownedAssets}
                        </Text>
                        <Text color="gray.600" textAlign="center">
                          Owned Assets
                        </Text>
                      </VStack>
                      <VStack align="center" spacing={1}>
                        <Text fontWeight="medium" color="orange.600">
                          {selectedSearch.wikipediaPresence}
                        </Text>
                        <Text color="gray.600" textAlign="center">
                          Wikipedia
                        </Text>
                      </VStack>
                      <VStack align="center" spacing={1}>
                        <Text fontWeight="medium" color="teal.600">
                          {selectedSearch.aiOverviews}
                        </Text>
                        <Text color="gray.600" textAlign="center">
                          AI Overviews
                        </Text>
                      </VStack>
                      <VStack align="center" spacing={1}>
                        <Text fontWeight="medium" color="pink.600">
                          {selectedSearch.geoPresence}%
                        </Text>
                        <Text color="gray.600" textAlign="center">
                          GEO Presence
                        </Text>
                      </VStack>
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody maxH="60vh" overflowY="auto">
              {selectedSearch && (
                <>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    mb={4}
                    color="gray.700"
                  >
                    Individual Search Results
                  </Text>
                  <SearchResults
                    keyword={selectedSearch.keyword}
                    results={selectedSearch.searchResults || []}
                    isVisible={true}
                    entityType={
                      selectedSearch.entityType as
                        | "individual"
                        | "company"
                        | "public-figure"
                    }
                  />
                </>
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
