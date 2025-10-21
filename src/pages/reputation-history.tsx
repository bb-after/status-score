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
  }, [user, authLoading, fetchHistory]);

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

      if (!user?.email) {
        setError("User email not available");
        return;
      }

      const response = await fetch(`/api/reputation/client-searches?${params}`, {
        headers: {
          'Authorization': `Bearer ${user.email}`
        }
      });

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
  }, [user]);

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

  // Helper function to get rating and suggestions for each score factor
  const getFactorRating = (factor: string, value: number) => {
    switch (factor) {
      case "positiveArticles":
        if (value >= 7) return { rating: "Excellent", color: "green.500", suggestion: "Outstanding positive coverage! Maintain this momentum with consistent quality content." };
        if (value >= 5) return { rating: "Great", color: "green.400", suggestion: "Strong positive presence. Consider creating more engaging content to reach excellence." };
        if (value >= 3) return { rating: "Good", color: "blue.500", suggestion: "Solid foundation. Focus on publishing high-quality content and engaging with your audience." };
        if (value >= 1) return { rating: "Needs Work", color: "orange.500", suggestion: "Limited positive coverage. Develop a content strategy and improve your online presence." };
        return { rating: "Poor", color: "red.500", suggestion: "No positive articles found. Urgent need for reputation building through quality content and PR efforts." };

      case "negativeLinks":
        if (value === 0) return { rating: "Excellent", color: "green.500", suggestion: "Perfect! No negative content found. Keep monitoring and maintaining this clean reputation." };
        if (value <= 2) return { rating: "Good", color: "blue.500", suggestion: "Minor negative presence. Monitor closely and consider reputation management strategies." };
        if (value <= 5) return { rating: "Concerning", color: "orange.500", suggestion: "Moderate negative content. Implement active reputation management and create positive content to offset." };
        return { rating: "Critical", color: "red.500", suggestion: "High negative coverage. Urgent reputation repair needed - consider professional reputation management services." };

      case "socialPresence":
        if (value >= 80) return { rating: "Excellent", color: "green.500", suggestion: "Strong social media presence! Continue engaging with your audience consistently." };
        if (value >= 60) return { rating: "Good", color: "blue.500", suggestion: "Solid social presence. Increase posting frequency and engagement to reach the next level." };
        if (value >= 40) return { rating: "Needs Work", color: "orange.500", suggestion: "Limited social presence. Focus on building followers and creating engaging content." };
        return { rating: "Poor", color: "red.500", suggestion: "Weak social presence. Establish active profiles on major platforms and develop a content strategy." };

      case "ownedAssets":
        if (value >= 5) return { rating: "Excellent", color: "green.500", suggestion: "Outstanding control over your digital presence! You own multiple top search results." };
        if (value >= 3) return { rating: "Great", color: "green.400", suggestion: "Strong ownership of search results. Consider creating one or two more owned properties." };
        if (value >= 1) return { rating: "OK", color: "blue.500", suggestion: "Some owned assets. Build more owned properties like websites, social profiles, and professional pages." };
        return { rating: "Poor", color: "red.500", suggestion: "No owned assets in top results. Create professional website, LinkedIn profile, and other owned properties." };

      case "wikipediaPresence":
        if (value >= 3) return { rating: "Excellent", color: "green.500", suggestion: "Strong Wikipedia presence indicates high authority and credibility." };
        if (value >= 1) return { rating: "Good", color: "blue.500", suggestion: "Some Wikipedia presence. Work on increasing your notability and contributions to relevant articles." };
        return { rating: "None", color: "gray.500", suggestion: "No Wikipedia presence. Focus on building notable achievements and contributions in your field." };

      case "aiOverviews":
        if (value >= 3) return { rating: "Excellent", color: "green.500", suggestion: "Strong AI overview presence! You're well-represented in AI-powered search results." };
        if (value >= 1) return { rating: "Good", color: "blue.500", suggestion: "Some AI coverage. Continue creating quality content that AI systems can understand and feature." };
        return { rating: "None", color: "gray.500", suggestion: "No AI overview presence. Focus on creating structured, authoritative content that AI systems can easily process." };

      default:
        return { rating: "Unknown", color: "gray.500", suggestion: "Unable to determine rating for this factor." };
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
                  <Card 
                    key={group.keyword} 
                    shadow="sm" 
                    borderWidth="1px"
                    cursor="pointer"
                    _hover={{
                      shadow: "md",
                      borderColor: "teal.200"
                    }}
                    transition="all 0.2s"
                    onClick={() => toggleKeywordExpansion(group.keyword)}
                  >
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
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleKeywordExpansion(group.keyword);
                            }}
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
                                cursor="pointer"
                                _hover={{
                                  bg: "gray.100",
                                  borderColor: "teal.200",
                                  shadow: "md"
                                }}
                                transition="all 0.2s"
                                onClick={() => handleViewDetails(search)}
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
                                      {search.negativeLinks === 0 ? "0" : `-${search.negativeLinks}`} Negative
                                    </Text>
                                    <Text color="blue.600">
                                      {search.socialPresence}% Social
                                    </Text>
                                    <Text color="purple.600">
                                      {search.ownedAssets} Owned
                                    </Text>
                                  </SimpleGrid>

                                  <HStack spacing={1} fontSize="xs" color="teal.600" align="center">
                                    <ViewIcon />
                                    <Text>Click to view details</Text>
                                  </HStack>
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
                      columns={{ base: 1, md: 2, lg: 3 }}
                      spacing={6}
                      fontSize="sm"
                    >
                      {[
                        { 
                          key: "positiveArticles", 
                          value: selectedSearch.positiveArticles, 
                          label: "Positive Articles", 
                          displayValue: `+${selectedSearch.positiveArticles}`,
                          color: "green.600" 
                        },
                        { 
                          key: "negativeLinks", 
                          value: selectedSearch.negativeLinks, 
                          label: "Negative Links", 
                          displayValue: selectedSearch.negativeLinks === 0 ? "0" : `-${selectedSearch.negativeLinks}`,
                          color: "red.600" 
                        },
                        { 
                          key: "socialPresence", 
                          value: selectedSearch.socialPresence, 
                          label: "Social Presence", 
                          displayValue: `${selectedSearch.socialPresence}%`,
                          color: "blue.600" 
                        },
                        { 
                          key: "ownedAssets", 
                          value: selectedSearch.ownedAssets, 
                          label: "Owned Assets", 
                          displayValue: `${selectedSearch.ownedAssets}`,
                          color: "purple.600" 
                        },
                        { 
                          key: "wikipediaPresence", 
                          value: selectedSearch.wikipediaPresence, 
                          label: "Wikipedia", 
                          displayValue: `${selectedSearch.wikipediaPresence}`,
                          color: "orange.600" 
                        },
                        { 
                          key: "aiOverviews", 
                          value: selectedSearch.aiOverviews, 
                          label: "AI Overviews", 
                          displayValue: `${selectedSearch.aiOverviews}`,
                          color: "teal.600" 
                        }
                      ].map((factor) => {
                        const rating = getFactorRating(factor.key, factor.value);
                        return (
                          <VStack key={factor.key} align="center" spacing={2}>
                            <Text fontWeight="medium" color={factor.color} fontSize="lg">
                              {factor.displayValue}
                            </Text>
                            <Text color="gray.600" textAlign="center" fontSize="xs">
                              {factor.label}
                            </Text>
                            <Tooltip
                              label={rating.suggestion}
                              placement="top"
                              hasArrow
                              bg="gray.700"
                              color="white"
                              fontSize="xs"
                              p={3}
                              maxW="250px"
                              textAlign="center"
                            >
                              <Badge
                                colorScheme={
                                  rating.color === "green.500" ? "green" :
                                  rating.color === "green.400" ? "green" :
                                  rating.color === "blue.500" ? "blue" :
                                  rating.color === "orange.500" ? "orange" :
                                  rating.color === "red.500" ? "red" : "gray"
                                }
                                variant="subtle"
                                fontSize="xs"
                                px={2}
                                py={1}
                                cursor="pointer"
                              >
                                {rating.rating}
                              </Badge>
                            </Tooltip>
                          </VStack>
                        );
                      })}
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
