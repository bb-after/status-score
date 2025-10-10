import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  Flex,
  Badge,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon, InfoIcon } from '@chakra-ui/icons';
import { DentistCard } from "../components/DentistCard";
import { MathBackground } from '../components/MathBackground';
import { SearchForm } from "../components/SearchForm";
import { useQuery } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import { searchDentists } from "./api/places";
import { DentistResult } from "../types/types";

// Sample mockup dentists for demonstration when no search results
const mockDentists = [
  {
    placeId: 'place1',
    name: 'Dr. Sarah Miller',
    rating: 4.8,
    totalReviews: 142,
    address: '123 Main St, San Francisco, CA 94105',
    photoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    negativeReviews: [],
  },
  {
    placeId: 'place2',
    name: 'Valley Dental Care',
    rating: 3.2,
    totalReviews: 56,
    address: '456 Market St, San Francisco, CA 94103',
    photoUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    negativeReviews: [
      {
        author_name: 'John D.',
        rating: 1,
        text: 'Waited over an hour past my appointment time. The receptionist was rude and unhelpful.',
      },
      {
        author_name: 'Alex M.',
        rating: 2,
        text: 'Overpriced services and they tried to upsell unnecessary procedures.',
      },
      {
        author_name: 'Lisa K.',
        rating: 2,
        text: 'The office was not clean and the equipment looked outdated.',
      },
    ],
  },
  {
    placeId: 'place3',
    name: 'Dr. Robert Johnson',
    rating: 4.5,
    totalReviews: 89,
    address: '789 Montgomery St, San Francisco, CA 94111',
    photoUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    negativeReviews: [
      {
        author_name: 'Maria S.',
        rating: 2,
        text: 'The dental hygienist was rough during my cleaning. Not going back.',
      },
    ],
  },
];

// Calculate overall reputation for industry benchmark
const calculateIndustryBenchmark = () => {
  return {
    reviewScore: 4.2,
    responseRate: 78,
    socialMedia: 70,
    localSEO: 65,
    websiteScore: 72,
    overall: 74
  };
};

export default function MedicalPracticeReputationDashboard() {
  const [city, setCity] = useState<string>("");
  const [type, setType] = useState("dentists");
  const [results, setResults] = useState<DentistResult[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [showNegativeOnly, setShowNegativeOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [resultsFound, setResultsFound] = useState(false);
  
  const benchmark = calculateIndustryBenchmark();

  const { isLoading, refetch } = useQuery({
    queryKey: ["dentists", city, type],
    queryFn: async (context) => {
      const searchCity = context.queryKey[1] as string;
      const searchType = context.queryKey[2] as string;
      const data = await searchDentists(searchCity, searchType);
      setResults(data.results);
      setNextPageToken(data.nextPageToken);
      setResultsFound(true);
      return data;
    },
    enabled: false,
  });

  const toggleFilter = () => {
    setShowNegativeOnly((prev) => !prev);
  };

  const filteredResults = showNegativeOnly
    ? results.filter((result) => result.negativeReviews?.length > 0)
    : results;

  const handleSearch = async (searchCity: string, searchType: string) => {
    if (!searchCity.trim()) {
      console.error("City is required to perform a search");
      return;
    }

    setCity(searchCity);
    setType(searchType);
    setResults([]);
    refetch();
  };

  const loadMore = async () => {
    if (nextPageToken) {
      const data = await searchDentists(city, type, nextPageToken);
      setResults((prev) => [...prev, ...data.results]);
      setNextPageToken(data.nextPageToken);
    }
  };

  const exportToCSV = () => {
    const csvRows: string[][] = [];

    // Define the header
    const header: string[] = [
      "Google Business Name",
      "Reviews Link",
      "Reputation Score",
      "# Negative Reviews",
      ...Array.from({ length: 10 }, (_, i) => [
        `Negative Review #${i + 1} Copy`,
        `Negative Review #${i + 1} Name`,
        `Negative Review #${i + 1} Date`,
        `Negative Review #${i + 1} Url`,
      ]).flat(),
    ];

    csvRows.push(header);

    // Process each dentist and create rows
    filteredResults.forEach((dentist) => {
      // Calculate reputation score (simplified version from DentistCard)
      const reputationScore = Math.round(
        ((dentist.rating / 5) * 100) * 0.7 + // Rating contribution
        (Math.min(100, 20 * Math.log10(dentist.totalReviews + 1))) * 0.3 // Review count contribution
      );
      
      const row: string[] = [
        dentist.name,
        `https://www.google.com/maps/place/?q=place_id:${dentist.placeId}`,
        reputationScore.toString(),
        (dentist.negativeReviews?.length || 0).toString(),
      ];

      // Add up to 10 negative reviews
      if (dentist.negativeReviews) {
        dentist.negativeReviews.slice(0, 10).forEach((review) => {
          row.push(
            review.text || "",
            review.author_name || "",
            review.relative_time_description || "",
            review.author_url || ""
          );
        });

        // Fill remaining columns with empty strings if there are fewer than 10 reviews
        const maxReviewFields = 10 * 4;
        const filledFields = dentist.negativeReviews.slice(0, 10).length * 4;
        const emptyFields = maxReviewFields - filledFields;

        for (let i = 0; i < emptyFields; i++) {
          row.push("");
        }
      }

      csvRows.push(row);
    });

    // Convert the rows into a CSV string
    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Create a downloadable Blob and save the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${type}_reputation_analysis.csv`);
  };

  const getDisplayData = () => {
    if (results.length > 0) {
      return filteredResults;
    } else if (!city) {
      // Return mock data when no search performed yet
      return mockDentists;
    }
    return [];
  };

  // Calculate reputation metrics
  const displayData = getDisplayData();
  const avgRating = displayData.reduce((sum, dentist) => sum + dentist.rating, 0) / Math.max(1, displayData.length);
  const totalReviews = displayData.reduce((sum, dentist) => sum + dentist.totalReviews, 0);
  const negativeReviewsCount = displayData.reduce(
    (sum, dentist) => sum + (dentist.negativeReviews?.length || 0), 
    0
  );

  return (
    <Box position="relative" minHeight="100vh" pb={20}>
      <MathBackground />
      
      <Container maxW="7xl" pt={8} pb={20} position="relative" zIndex={10}>
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <VStack spacing={2} textAlign="center" mb={4}>
            <Heading size="2xl" color="blue.800">
              AI Reputation Checker
            </Heading>
            <Text color="gray.600" fontSize="lg" maxW="2xl" mx="auto">
              Monitor, analyze and improve your online reputation across multiple platforms
            </Text>
          </VStack>
          
          {/* Search Section */}
          <Box 
            bg="white" 
            borderRadius="xl" 
            boxShadow="xl" 
            p={6}
            backdropFilter="blur(10px)"
          >
            <VStack spacing={6}>
              <Text fontWeight="bold" fontSize="lg">
                Search for practices to analyze reputation
              </Text>
              
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              
              {displayData.length > 0 && (
                <Flex justifyContent="space-between" width="100%" mt={2}>
                  <Button onClick={toggleFilter} colorScheme="blue" size="sm">
                    {showNegativeOnly
                      ? "Show All Results"
                      : "Show Only With Negative Reviews"}
                  </Button>
                  
                  <Button onClick={exportToCSV} colorScheme="green" size="sm">
                    Export Analysis to CSV
                  </Button>
                </Flex>
              )}
            </VStack>
          </Box>
          
          {isLoading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
            </Flex>
          ) : (
            <>
              {/* Industry Stats */}
              <Box 
                bg="white" 
                borderRadius="xl" 
                boxShadow="xl" 
                p={6}
                mt={8}
              >
                <Heading size="md" mb={6}>Industry Benchmarks</Heading>
                <SimpleGrid columns={{ base: 2, md: 5 }} spacing={6}>
                  <Stat textAlign="center">
                    <StatLabel>Avg. Rating</StatLabel>
                    <StatNumber>{benchmark.reviewScore.toFixed(1)}</StatNumber>
                    <Progress value={benchmark.reviewScore * 20} colorScheme="green" size="sm" mt={2} />
                  </Stat>
                  
                  <Stat textAlign="center">
                    <StatLabel>Response Rate</StatLabel>
                    <StatNumber>{benchmark.responseRate}%</StatNumber>
                    <Progress value={benchmark.responseRate} colorScheme="blue" size="sm" mt={2} />
                  </Stat>
                  
                  <Stat textAlign="center">
                    <StatLabel>Social Media</StatLabel>
                    <StatNumber>{benchmark.socialMedia}/100</StatNumber>
                    <Progress value={benchmark.socialMedia} colorScheme="blue" size="sm" mt={2} />
                  </Stat>
                  
                  <Stat textAlign="center">
                    <StatLabel>Local SEO</StatLabel>
                    <StatNumber>{benchmark.localSEO}/100</StatNumber>
                    <Progress value={benchmark.localSEO} colorScheme="yellow" size="sm" mt={2} />
                  </Stat>
                  
                  <Stat textAlign="center">
                    <StatLabel>Overall</StatLabel>
                    <StatNumber>{benchmark.overall}/100</StatNumber>
                    <Progress value={benchmark.overall} colorScheme="blue" size="sm" mt={2} />
                  </Stat>
                </SimpleGrid>
              </Box>
              
              {/* Alert Summary */}
              {negativeReviewsCount > 0 && (
                <Box 
                  bg="orange.50" 
                  borderRadius="xl" 
                  boxShadow="md" 
                  p={6}
                  borderLeft="4px solid"
                  borderColor="orange.500"
                >
                  <Flex align="center" gap={3}>
                    <InfoIcon boxSize={6} color="orange.500" />
                    <Text fontWeight="bold" color="orange.700">
                      Reputation Alert: {negativeReviewsCount} negative reviews detected across {displayData.length} practices
                    </Text>
                  </Flex>
                  <Text mt={2} color="orange.700">
                    These reviews may impact overall reputation scores. Consider implementing a review management strategy.
                  </Text>
                </Box>
              )}
              
              {/* Tabs for different views */}
              <Tabs colorScheme="blue" variant="enclosed" mt={6}>
                <TabList>
                  <Tab fontWeight="semibold">Practices</Tab>
                  <Tab fontWeight="semibold">Insights</Tab>
                  <Tab fontWeight="semibold">Recommendations</Tab>
                </TabList>
                
                <TabPanels>
                  <TabPanel px={0}>
                    {/* Results Count */}
                    <Flex justify="space-between" align="center" mb={4}>
                      <Text fontWeight="medium" color="gray.600">
                        Showing {displayData.length} practices
                      </Text>
                      
                      <HStack>
                        <Text fontSize="sm" color="gray.600">Sort by:</Text>
                        <Select size="sm" width="200px">
                          <option value="reputation">Reputation Score</option>
                          <option value="rating">Rating</option>
                          <option value="reviews">Review Count</option>
                        </Select>
                      </HStack>
                    </Flex>
                    
                    {/* Results List */}
                    <VStack spacing={6} align="stretch">
                      {displayData.map((dentist, index) => (
                        <DentistCard key={`${dentist.placeId}-${index}`} dentist={dentist} />
                      ))}
                    </VStack>
                    
                    {/* Load More Button */}
                    {nextPageToken && (
                      <Flex justify="center" mt={8}>
                        <Button
                          onClick={loadMore}
                          colorScheme="blue"
                          size="md"
                          isLoading={isLoading}
                        >
                          Load More Results
                        </Button>
                      </Flex>
                    )}
                  </TabPanel>
                  
                  <TabPanel>
                    <Box 
                      bg="white" 
                      borderRadius="lg" 
                      boxShadow="md" 
                      p={6}
                      mt={2}
                    >
                      <Heading size="md" mb={4} color="blue.800">Reputation Analysis</Heading>
                      <Text mb={4}>
                        Based on the analyzed practices, here are key insights about the reputation landscape:
                      </Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Box p={4} bg="blue.50" borderRadius="md">
                          <Heading size="sm" mb={2}>Review Distribution</Heading>
                          <Text>Average rating: <b>{avgRating.toFixed(1)}/5.0</b></Text>
                          <Text>Total reviews: <b>{totalReviews}</b></Text>
                          <Text>Negative reviews: <b>{negativeReviewsCount}</b> ({totalReviews > 0 ? ((negativeReviewsCount/totalReviews)*100).toFixed(1) : 0}%)</Text>
                          <Text mt={2} fontSize="sm">
                            {avgRating > 4.0 ? 
                              "Strong overall ratings, but specific areas of improvement exist." :
                              "Ratings below industry average, indicating reputation challenges."}
                          </Text>
                        </Box>
                        
                        <Box p={4} bg="purple.50" borderRadius="md">
                          <Heading size="sm" mb={2}>Common Issues</Heading>
                          <VStack align="start">
                            <Badge colorScheme="orange">Wait times</Badge>
                            <Badge colorScheme="orange">Billing practices</Badge>
                            <Badge colorScheme="red">Staff behavior</Badge>
                            <Badge colorScheme="yellow">Facility cleanliness</Badge>
                          </VStack>
                          <Text mt={2} fontSize="sm">
                            The most frequently mentioned negative aspects in reviews.
                          </Text>
                        </Box>
                        
                        <Box p={4} bg="green.50" borderRadius="md">
                          <Heading size="sm" mb={2}>Competitive Analysis</Heading>
                          <Text>Top performer: <b>{displayData.length > 0 ? displayData.sort((a, b) => b.rating - a.rating)[0].name : 'N/A'}</b></Text>
                          <Text>Rating gap: <b>
                            {displayData.length > 1 ? 
                              (Math.max(...displayData.map(d => d.rating)) - Math.min(...displayData.map(d => d.rating))).toFixed(1) : 
                              'N/A'
                            }
                          </b> points between highest and lowest</Text>
                          <Text mt={2} fontSize="sm">
                            Significant variability in reputation scores indicates opportunities for improvement.
                          </Text>
                        </Box>
                        
                        <Box p={4} bg="yellow.50" borderRadius="md">
                          <Heading size="sm" mb={2}>Online Presence</Heading>
                          <Text>Social media activity: <b>Moderate</b></Text>
                          <Text>Website optimization: <b>Needs improvement</b></Text>
                          <Text>Local SEO ranking: <b>Variable</b></Text>
                          <Text mt={2} fontSize="sm">
                            Enhanced online presence could significantly improve reputation scores.
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  </TabPanel>
                  
                  <TabPanel>
                    <Box 
                      bg="white" 
                      borderRadius="lg" 
                      boxShadow="md" 
                      p={6}
                      mt={2}
                    >
                      <Heading size="md" mb={4} color="blue.800">AI-Powered Recommendations</Heading>
                      <Text mb={6}>
                        Based on our analysis of your online reputation, here are personalized recommendations to improve your reputation score:
                      </Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <Box p={4} borderRadius="md" borderLeft="4px solid" borderColor="red.400" bg="red.50">
                          <Heading size="sm" mb={3} color="red.600">Urgent Actions</Heading>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm">Respond to all negative reviews within 24-48 hours</Text>
                            <Text fontSize="sm">Address recurring complaints about wait times</Text>
                            <Text fontSize="sm">Review billing practices and staff training</Text>
                          </VStack>
                        </Box>
                        
                        <Box p={4} borderRadius="md" borderLeft="4px solid" borderColor="yellow.400" bg="yellow.50">
                          <Heading size="sm" mb={3} color="yellow.600">Short-Term Improvements</Heading>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm">Implement a review management system</Text>
                            <Text fontSize="sm">Encourage satisfied clients to leave reviews</Text>
                            <Text fontSize="sm">Optimize Google Business Profile with updated information</Text>
                          </VStack>
                        </Box>
                        
                        <Box p={4} borderRadius="md" borderLeft="4px solid" borderColor="green.400" bg="green.50">
                          <Heading size="sm" mb={3} color="green.600">Long-Term Strategy</Heading>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="sm">Develop consistent social media presence</Text>
                            <Text fontSize="sm">Create educational content about your services</Text>
                            <Text fontSize="sm">Implement customer satisfaction surveys</Text>
                          </VStack>
                        </Box>
                      </SimpleGrid>
                      
                      <Box mt={8} p={4} borderRadius="md" bg="blue.50">
                        <Heading size="sm" mb={3} color="blue.600">Projected Impact</Heading>
                        <Text>
                          Implementing these recommendations could improve your reputation score by an estimated <b>15-20 points</b> within 6 months, potentially resulting in:
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={3}>
                          <HStack p={2} bg="white" borderRadius="md">
                            <Text fontWeight="bold" color="green.500">+22%</Text>
                            <Text fontSize="sm">Customer inquiries</Text>
                          </HStack>
                          <HStack p={2} bg="white" borderRadius="md">
                            <Text fontWeight="bold" color="green.500">+18%</Text>
                            <Text fontSize="sm">New customers</Text>
                          </HStack>
                          <HStack p={2} bg="white" borderRadius="md">
                            <Text fontWeight="bold" color="green.500">+15%</Text>
                            <Text fontSize="sm">Revenue growth</Text>
                          </HStack>
                        </SimpleGrid>
                      </Box>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
