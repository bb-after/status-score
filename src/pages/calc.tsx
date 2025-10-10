import React, { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  SimpleGrid,
  Text,
  FormControl,
  FormLabel,
  Container,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Flex,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Divider,
  Select,
} from "@chakra-ui/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Layout from "../components/Layout";
import { MathBackground } from "../components/MathBackground";

export default function ReputationScoreCalculator() {
  // State for reputation factors
  const [socialMediaPresence, setSocialMediaPresence] = useState(60);
  const [reviewScore, setReviewScore] = useState(4.2);
  const [reviewCount, setReviewCount] = useState(35);
  const [negativeContentCount, setNegativeContentCount] = useState(2);
  const [positiveContentCount, setPositiveContentCount] = useState(15);
  const [websiteScore, setWebsiteScore] = useState(75);
  const [industrySelection, setIndustrySelection] = useState("healthcare");

  // Industry factors and weights
  const industryFactors = {
    healthcare: {
      socialMediaWeight: 0.15,
      reviewWeight: 0.30,
      reviewCountWeight: 0.15,
      contentWeight: 0.25,
      websiteWeight: 0.15,
      benchmark: 78,
    },
    finance: {
      socialMediaWeight: 0.10,
      reviewWeight: 0.35,
      reviewCountWeight: 0.15,
      contentWeight: 0.25,
      websiteWeight: 0.15,
      benchmark: 82,
    },
    retail: {
      socialMediaWeight: 0.25,
      reviewWeight: 0.30,
      reviewCountWeight: 0.10,
      contentWeight: 0.20,
      websiteWeight: 0.15,
      benchmark: 75,
    },
    technology: {
      socialMediaWeight: 0.20,
      reviewWeight: 0.20,
      reviewCountWeight: 0.10,
      contentWeight: 0.30,
      websiteWeight: 0.20,
      benchmark: 80,
    },
    legal: {
      socialMediaWeight: 0.10,
      reviewWeight: 0.35,
      reviewCountWeight: 0.15,
      contentWeight: 0.25,
      websiteWeight: 0.15,
      benchmark: 83,
    },
  };

  // Calculate the reputation score
  const calculateReputationScore = () => {
    const weights = industryFactors[industrySelection];
    
    // Normalize review score (1-5 scale to 0-100)
    const normalizedReviewScore = (reviewScore / 5) * 100;
    
    // Calculate content sentiment score
    const totalContent = positiveContentCount + negativeContentCount;
    const contentScore = totalContent > 0 
      ? (positiveContentCount / totalContent) * 100 
      : 50;
    
    // Calculate review count score (logarithmic scale)
    const reviewCountScore = Math.min(100, 20 * Math.log10(reviewCount + 1));
    
    // Calculate the weighted score
    const score = 
      socialMediaPresence * weights.socialMediaWeight +
      normalizedReviewScore * weights.reviewWeight +
      reviewCountScore * weights.reviewCountWeight +
      contentScore * weights.contentWeight +
      websiteScore * weights.websiteWeight;
    
    return Math.round(score);
  };

  const reputationScore = calculateReputationScore();
  const industryBenchmark = industryFactors[industrySelection].benchmark;
  const scoreComparison = reputationScore - industryBenchmark;
  
  // Historical data simulation
  const historicalData = [
    { month: 'Jan', score: Math.max(0, reputationScore - 12 + Math.random() * 5) },
    { month: 'Feb', score: Math.max(0, reputationScore - 10 + Math.random() * 5) },
    { month: 'Mar', score: Math.max(0, reputationScore - 8 + Math.random() * 5) },
    { month: 'Apr', score: Math.max(0, reputationScore - 6 + Math.random() * 4) },
    { month: 'May', score: Math.max(0, reputationScore - 3 + Math.random() * 4) },
    { month: 'Jun', score: Math.max(0, reputationScore - 1 + Math.random() * 3) },
    { month: 'Current', score: reputationScore },
  ];
  
  // Projected data simulation
  const projectedData = [
    { month: 'Current', score: reputationScore },
    { month: 'Month 1', score: Math.min(100, reputationScore + 2 + Math.random() * 2) },
    { month: 'Month 2', score: Math.min(100, reputationScore + 4 + Math.random() * 3) },
    { month: 'Month 3', score: Math.min(100, reputationScore + 7 + Math.random() * 3) },
    { month: 'Month 4', score: Math.min(100, reputationScore + 9 + Math.random() * 4) },
    { month: 'Month 5', score: Math.min(100, reputationScore + 12 + Math.random() * 4) },
    { month: 'Month 6', score: Math.min(100, reputationScore + 15 + Math.random() * 5) },
  ];

  // Reputation score interpretation
  const getScoreInterpretation = (score) => {
    if (score >= 90) return { label: "Excellent", color: "green.500" };
    if (score >= 80) return { label: "Very Good", color: "teal.500" };
    if (score >= 70) return { label: "Good", color: "blue.500" };
    if (score >= 60) return { label: "Fair", color: "yellow.500" };
    if (score >= 50) return { label: "Needs Improvement", color: "orange.500" };
    return { label: "Poor", color: "red.500" };
  };

  const scoreDetails = getScoreInterpretation(reputationScore);

  return (
    <Box position="relative" overflow="hidden">
      <MathBackground />
      <Container maxW="6xl" p={4} position="relative" zIndex={10}>
        <VStack spacing={6} align="stretch">
          <Box 
            p={6} 
            borderRadius="xl" 
            bg="rgba(255, 255, 255, 0.9)"
            backdropFilter="blur(10px)"
            boxShadow="xl"
          >
            <Heading size="lg" mb={6} color="blue.800">AI Reputation Score Calculator</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* Input Section */}
              <Box>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel fontWeight="medium">Industry</FormLabel>
                    <Select 
                      value={industrySelection} 
                      onChange={(e) => setIndustrySelection(e.target.value)}
                      bg="white"
                      borderColor="gray.300"
                    >
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="retail">Retail</option>
                      <option value="technology">Technology</option>
                      <option value="legal">Legal</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Social Media Presence Score (0-100)</FormLabel>
                    <Slider 
                      value={socialMediaPresence} 
                      onChange={(val) => setSocialMediaPresence(val)}
                      min={0}
                      max={100}
                      step={1}
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} bg="blue.500">
                        <Box color="white" fontSize="xs">{socialMediaPresence}</Box>
                      </SliderThumb>
                    </Slider>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Average Review Rating (1-5)</FormLabel>
                    <Slider 
                      value={reviewScore} 
                      onChange={(val) => setReviewScore(val)}
                      min={1}
                      max={5}
                      step={0.1}
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} bg="blue.500">
                        <Box color="white" fontSize="xs">{reviewScore}</Box>
                      </SliderThumb>
                    </Slider>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Number of Reviews</FormLabel>
                    <Input 
                      type="number" 
                      value={reviewCount} 
                      onChange={(e) => setReviewCount(parseInt(e.target.value) || 0)}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  
                  <HStack spacing={4}>
                    <FormControl>
                      <FormLabel fontWeight="medium">Negative Content</FormLabel>
                      <Input 
                        type="number" 
                        value={negativeContentCount} 
                        onChange={(e) => setNegativeContentCount(parseInt(e.target.value) || 0)}
                        bg="white"
                        borderColor="gray.300"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontWeight="medium">Positive Content</FormLabel>
                      <Input 
                        type="number" 
                        value={positiveContentCount} 
                        onChange={(e) => setPositiveContentCount(parseInt(e.target.value) || 0)}
                        bg="white"
                        borderColor="gray.300"
                      />
                    </FormControl>
                  </HStack>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Website Quality Score (0-100)</FormLabel>
                    <Slider 
                      value={websiteScore} 
                      onChange={(val) => setWebsiteScore(val)}
                      min={0}
                      max={100}
                      step={1}
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} bg="blue.500">
                        <Box color="white" fontSize="xs">{websiteScore}</Box>
                      </SliderThumb>
                    </Slider>
                  </FormControl>
                </VStack>
              </Box>
              
              {/* Results Section */}
              <Box>
                <VStack spacing={6} align="stretch">
                  <Box 
                    p={6} 
                    borderRadius="lg" 
                    bg={`linear-gradient(135deg, ${scoreDetails.color}, ${scoreDetails.color}40)`}
                    color="white"
                    textAlign="center"
                  >
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Your Reputation Score</Text>
                    <Heading size="4xl">{reputationScore}</Heading>
                    <Badge 
                      colorScheme={scoreDetails.color.split('.')[0]} 
                      fontSize="md" 
                      borderRadius="full" 
                      px={3} 
                      py={1}
                      mt={2}
                    >
                      {scoreDetails.label}
                    </Badge>
                  </Box>
                  
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat 
                      bg="white" 
                      p={4} 
                      borderRadius="lg" 
                      boxShadow="sm"
                    >
                      <StatLabel>Industry Average</StatLabel>
                      <StatNumber>{industryBenchmark}</StatNumber>
                    </Stat>
                    
                    <Stat 
                      bg="white" 
                      p={4} 
                      borderRadius="lg" 
                      boxShadow="sm"
                    >
                      <StatLabel>Comparison</StatLabel>
                      <StatNumber>
                        <StatArrow type={scoreComparison >= 0 ? "increase" : "decrease"} />
                        {Math.abs(scoreComparison)}
                      </StatNumber>
                      <StatHelpText>
                        {scoreComparison >= 0 ? "Above Average" : "Below Average"}
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                  
                  <Box 
                    p={4} 
                    bg="white" 
                    borderRadius="lg" 
                    boxShadow="sm"
                  >
                    <Text fontWeight="medium" mb={2}>Factor Weights for {industrySelection.charAt(0).toUpperCase() + industrySelection.slice(1)}</Text>
                    <SimpleGrid columns={2} spacing={2}>
                      <Text fontSize="sm">Social Media: {industryFactors[industrySelection].socialMediaWeight * 100}%</Text>
                      <Text fontSize="sm">Reviews: {industryFactors[industrySelection].reviewWeight * 100}%</Text>
                      <Text fontSize="sm">Review Count: {industryFactors[industrySelection].reviewCountWeight * 100}%</Text>
                      <Text fontSize="sm">Content: {industryFactors[industrySelection].contentWeight * 100}%</Text>
                      <Text fontSize="sm">Website: {industryFactors[industrySelection].websiteWeight * 100}%</Text>
                    </SimpleGrid>
                  </Box>
                </VStack>
              </Box>
            </SimpleGrid>
          </Box>
          
          {/* Trend Analysis */}
          <Box 
            p={6} 
            borderRadius="xl" 
            bg="rgba(255, 255, 255, 0.9)"
            backdropFilter="blur(10px)"
            boxShadow="xl"
          >
            <Tabs colorScheme="blue" variant="soft-rounded">
              <TabList>
                <Tab>Historical Analysis</Tab>
                <Tab>Projection & Forecast</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <Heading size="md" mb={4} color="blue.800">6-Month Historical Trend</Heading>
                  <Box height="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#3182CE" 
                          strokeWidth={3}
                          dot={{ r: 5 }}
                          activeDot={{ r: 8 }}
                          name="Reputation Score"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </TabPanel>
                
                <TabPanel>
                  <Heading size="md" mb={4} color="blue.800">6-Month Reputation Forecast</Heading>
                  <Box height="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={projectedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#805AD5" 
                          strokeWidth={3}
                          dot={{ r: 5 }}
                          activeDot={{ r: 8 }}
                          name="Projected Score"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box mt={4} p={4} bg="purple.50" borderRadius="md">
                    <Text fontWeight="medium" color="purple.700">
                      Projected Improvement: <Box as="span" fontWeight="bold">
                        +{Math.round(projectedData[projectedData.length-1].score - reputationScore)} points
                      </Box> over 6 months with recommended optimizations
                    </Text>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
          
          {/* Recommendations */}
          <Box 
            p={6} 
            borderRadius="xl" 
            bg="rgba(255, 255, 255, 0.9)"
            backdropFilter="blur(10px)"
            boxShadow="xl"
          >
            <Heading size="md" mb={4} color="blue.800">AI-Powered Recommendations</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Box p={4} bg="blue.50" borderRadius="lg">
                <Text fontWeight="bold" color="blue.700" mb={2}>Highest Impact</Text>
                <Text>
                  {reviewScore < 4 
                    ? "Improve review ratings by addressing negative feedback and encouraging satisfied clients to leave reviews." 
                    : socialMediaPresence < 60 
                      ? "Increase social media presence with regular posting and engagement." 
                      : "Create more positive content about your services and expertise."}
                </Text>
              </Box>
              
              <Box p={4} bg="green.50" borderRadius="lg">
                <Text fontWeight="bold" color="green.700" mb={2}>Quick Wins</Text>
                <Text>
                  {reviewCount < 30 
                    ? "Follow up with clients to increase review count (target: 50+ reviews)." 
                    : websiteScore < 75 
                      ? "Improve website load time and mobile responsiveness." 
                      : "Address any negative content with positive counternarratives."}
                </Text>
              </Box>
              
              <Box p={4} bg="purple.50" borderRadius="lg">
                <Text fontWeight="bold" color="purple.700" mb={2}>Long-Term Strategy</Text>
                <Text>
                  {reviewScore < 4.5 
                    ? "Implement a review management system to handle feedback promptly." 
                    : positiveContentCount < 20
                      ? "Develop a content strategy to build authoritative presence in your field." 
                      : "Consider advanced reputation monitoring to stay ahead of potential issues."}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}