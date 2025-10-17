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
  Input,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { useUser } from '@auth0/nextjs-auth0/client';
import { ViewIcon, TimeIcon, RepeatIcon, SearchIcon } from "@chakra-ui/icons";
import { formatDistanceToNow } from "date-fns";
import { SearchResults } from "../components/reputation/SearchResults";

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

export default function ReputationHistory() {
  const { user, isLoading: authLoading } = useUser();
  const [history, setHistory] = useState<ReputationSearchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSearch, setSelectedSearch] = useState<ReputationSearchRecord | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (user && !authLoading) {
      fetchHistory();
    }
  }, [user, authLoading]);

  const fetchHistory = async (keyword = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      
      const response = await fetch(`/api/reputation/search-history?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data: HistoryResponse = await response.json();
      setHistory(data.searches);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load search history");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchHistory(searchKeyword);
  };

  const handleViewDetails = (search: ReputationSearchRecord) => {
    setSelectedSearch(search);
    onOpen();
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

  if (authLoading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="lg" />
          <Text>Loading...</Text>
        </VStack>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Please log in to view your reputation search history.
        </Alert>
      </Container>
    );
  }

  return (
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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
            <Button onClick={() => { setSearchKeyword(""); fetchHistory(); }} variant="outline">
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
        ) : history.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            No reputation searches found. Start by running your first analysis!
          </Alert>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {history.map((search) => (
              <Card key={search.id} shadow="sm" borderWidth="1px">
                <CardHeader pb={2}>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                          {search.keyword}
                        </Text>
                        <HStack spacing={2}>
                          <Badge
                            colorScheme={getEntityTypeBadgeColor(search.entityType)}
                            size="sm"
                          >
                            {search.entityType}
                          </Badge>
                          <Badge
                            colorScheme={getScoreColor(search.score)}
                            size="sm"
                          >
                            Score: {search.score}
                          </Badge>
                        </HStack>
                      </VStack>
                    </HStack>
                  </VStack>
                </CardHeader>

                <CardBody pt={0}>
                  <VStack align="stretch" spacing={3}>
                    {/* Quick Stats */}
                    <SimpleGrid columns={2} spacing={2} fontSize="sm">
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
                        {search.ownedAssets}% Owned
                      </Text>
                    </SimpleGrid>

                    {/* Timestamp */}
                    <HStack spacing={2} color="gray.500" fontSize="sm">
                      <TimeIcon boxSize={3} />
                      <Text>
                        {formatDistanceToNow(new Date(search.createdAt), {
                          addSuffix: true,
                        })}
                      </Text>
                    </HStack>

                    {/* Actions */}
                    <HStack spacing={2} pt={2}>
                      <Button
                        size="sm"
                        colorScheme="teal"
                        variant="outline"
                        leftIcon={<ViewIcon />}
                        onClick={() => handleViewDetails(search)}
                        flex={1}
                      >
                        View Results
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <Text>Search Results for &ldquo;{selectedSearch?.keyword}&rdquo;</Text>
              <HStack spacing={2}>
                <Badge
                  colorScheme={getEntityTypeBadgeColor(selectedSearch?.entityType || "")}
                  size="sm"
                >
                  {selectedSearch?.entityType}
                </Badge>
                <Badge
                  colorScheme={getScoreColor(selectedSearch?.score || 0)}
                  size="sm"
                >
                  Score: {selectedSearch?.score}
                </Badge>
                <Text fontSize="sm" color="gray.500">
                  {selectedSearch && formatDistanceToNow(new Date(selectedSearch.createdAt), {
                    addSuffix: true,
                  })}
                </Text>
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {selectedSearch && (
              <SearchResults
                keyword={selectedSearch.keyword}
                results={selectedSearch.searchResults || []}
                isVisible={true}
                entityType={selectedSearch.entityType as "individual" | "company" | "public-figure"}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}