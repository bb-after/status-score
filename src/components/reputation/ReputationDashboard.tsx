import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
  Alert,
  AlertIcon,
  Flex,
  Progress,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { WelcomeBanner } from "./WelcomeBanner";
import { useUser } from "@auth0/nextjs-auth0/client";
import { SearchSection } from "./SearchSection";
import { ScoreOverview } from "./ScoreOverview";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { SearchResults } from "./SearchResults";
import { HistoricalChart } from "./HistoricalChart";
import { ComparisonView } from "./ComparisonView";
import { ReputationActionItems } from "./ReputationActionItems";
import { ReputationScoreBreakdown } from "./ReputationScoreBreakdown";
import {
  calculateScoreFromLegacyData,
  type EntityType,
} from "../../utils/scoreCalculator";

export interface ReputationData {
  positiveArticles: number;
  wikipediaPresence: number;
  ownedAssets: number;
  negativeLinks: number;
  socialPresence: number;
  aiOverviews: number;
  geoPresence: number;
  totalResults?: number;
}

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  sentiment: "positive" | "neutral" | "negative";
  source: string;
  rank: number;
}

export interface AnalysisResult {
  keyword: string;
  entityType: "individual" | "company" | "public-figure";
  score: number;
  data: ReputationData;
  results: SearchResult[];
  timestamp: string;
  lowResultAlert?: {
    isLowCount: boolean;
    message?: string;
    suggestions?: string[];
  };
}

interface ReputationDashboardProps {
  onSearchIntercept?: (
    keyword: string,
    type: "individual" | "company" | "public-figure",
  ) => void;
  onCompareIntercept?: (
    keyword1: string,
    keyword2: string,
    type: "individual" | "company" | "public-figure",
  ) => boolean | void;
}

export function ReputationDashboard({
  onSearchIntercept,
  onCompareIntercept,
}: ReputationDashboardProps) {
  const { user } = useUser();
  const toast = useToast();

  // Wizard/Carousel step management
  const [currentStep, setCurrentStep] = useState(1); // 1: Search form, 2: Analyzing, 3: Results
  const [showDemoMode, setShowDemoMode] = useState(false);

  const [activeTab, setActiveTab] = useState(0); // 0: Individual, 1: Company, 2: Public Figure
  const [currentScore, setCurrentScore] = useState(37);
  const [scoreData, setScoreData] = useState<ReputationData>({
    positiveArticles: 5, // 5 positive articles
    wikipediaPresence: 2,
    ownedAssets: 4, // 4 owned assets (great score)
    negativeLinks: 0, // 5 neutral, 0 negative (should score ~80)
    socialPresence: 85,
    aiOverviews: 3,
    geoPresence: 70,
  });

  // Search functionality state
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Comparison state
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonData, setComparisonData] = useState<{
    entity1: any;
    entity2: any;
    type: "individual" | "company" | "public-figure";
  } | null>(null);

  // Historical data state
  const [historicalData, setHistoricalData] = useState<
    Array<{ date: string; score: number }>
  >([]);

  // Dismissable banners state
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [toastShown, setToastShown] = useState(false);
  const [lowResultAlert, setLowResultAlert] = useState<{
    isLowCount: boolean;
    message?: string;
    suggestions?: string[];
  } | null>(null);

  const entityTypes = ["individual", "company", "public-figure"] as const;

  // Handle score updates from SearchResults component
  const handleScoreUpdate = (newScoreData: {
    positiveArticles: number;
    negativeLinks: number;
    score: number;
  }) => {
    // Update the scoreData state with new values
    setScoreData((prevData) => ({
      ...prevData,
      positiveArticles: newScoreData.positiveArticles,
      negativeLinks: newScoreData.negativeLinks,
    }));

    // Update the current score
    setCurrentScore(newScoreData.score);
  };

  // Animation variants for step transitions
  const slideVariants = {
    initial: {
      opacity: 0,
      x: 100,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.6,
        opacity: { duration: 0.3 },
      },
    },
    exit: {
      opacity: 0,
      x: -50,
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 25,
        duration: 0.4,
      },
    },
  };

  const bounceVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.9,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.8,
      },
    },
  };

  const simulateProgress = () => {
    setSearchProgress(0);
    const progressSteps = [20, 40, 60, 80, 100];
    const delays = [800, 1000, 800, 700, 600];

    progressSteps.forEach((step, index) => {
      setTimeout(
        () => {
          setSearchProgress(step);
        },
        delays.slice(0, index + 1).reduce((sum, delay) => sum + delay, 0),
      );
    });
  };

  const handleSearch = async (
    keyword: string,
    type: "individual" | "company" | "public-figure",
  ) => {
    // Check if we need to intercept for authentication
    if (onSearchIntercept) {
      onSearchIntercept(keyword, type);
      return;
    }

    // Step 1 → Step 2: Move to analyzing state
    setCurrentStep(2);
    setIsSearching(true);
    setCurrentKeyword(keyword);
    setActiveTab(entityTypes.indexOf(type));
    setIsComparing(false);
    setComparisonData(null);
    setShowDemoMode(false);
    setToastShown(false); // Reset toast flag for new search

    simulateProgress();

    try {
      const response = await fetch("/api/reputation/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, entityType: type }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const analysis: AnalysisResult = await response.json();

      setCurrentScore(analysis.score);
      setScoreData(analysis.data);
      setSearchResults(analysis.results);
      setShowResults(true);
      setHasSearched(true);
      setLowResultAlert(analysis.lowResultAlert || null);

      // Load historical data
      const historyResponse = await fetch(
        `/api/reputation/history?keyword=${encodeURIComponent(keyword)}`,
      );
      if (historyResponse.ok) {
        const history = await historyResponse.json();
        setHistoricalData(history);
      }

      // Step 2 → Step 3: Move to results state
      setCurrentStep(3);

      if (!toastShown) {
        toast({
          title: "Analysis Complete",
          description: `Reputation score: ${analysis.score}/100`,
          status: "success",
          duration: 3000,
        });
        setToastShown(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
      // Reset to step 1 on error
      setCurrentStep(1);
      toast({
        title: "Analysis Failed",
        description: "Unable to complete reputation analysis",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSearching(false);
      setSearchProgress(0);
    }
  };

  const handleDemoMode = () => {
    setShowDemoMode(true);
    setCurrentStep(3); // Jump to results step for demo
    setHasSearched(true);
    setCurrentKeyword("Demo User");
    setActiveTab(0); // Individual

    // Use demo data that's already set in state
    toast({
      title: "Demo Mode Activated",
      description: "Showing sample reputation analysis",
      status: "info",
      duration: 3000,
    });
  };

  const handleCompare = async (
    keyword1: string,
    keyword2: string,
    type: "individual" | "company" | "public-figure",
  ) => {
    // Check if we need to intercept for authentication or premium check
    if (onCompareIntercept) {
      const shouldProceed = onCompareIntercept(keyword1, keyword2, type);
      if (shouldProceed !== true) {
        return; // Don't proceed if intercept doesn't explicitly return true
      }
    }

    setCurrentStep(2); // Move to analyzing step
    setIsSearching(true);
    setActiveTab(entityTypes.indexOf(type));
    setIsComparing(true);
    setShowResults(false);
    setShowDemoMode(false);

    simulateProgress();

    try {
      const [response1, response2] = await Promise.all([
        fetch("/api/reputation/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: keyword1, entityType: type }),
        }),
        fetch("/api/reputation/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: keyword2, entityType: type }),
        }),
      ]);

      if (!response1.ok || !response2.ok) throw new Error("Comparison failed");

      const [analysis1, analysis2] = await Promise.all([
        response1.json(),
        response2.json(),
      ]);

      setComparisonData({
        entity1: {
          keyword: keyword1,
          score: analysis1.score,
          data: analysis1.data,
          results: analysis1.results,
        },
        entity2: {
          keyword: keyword2,
          score: analysis2.score,
          data: analysis2.data,
          results: analysis2.results,
        },
        type,
      });

      // Move to step 3 for results
      setCurrentStep(3);

      toast({
        title: "Comparison Complete",
        description: `${keyword1}: ${analysis1.score} vs ${keyword2}: ${analysis2.score}`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Comparison failed:", error);
      // Reset to step 1 on error
      setCurrentStep(1);
      toast({
        title: "Comparison Failed",
        description: "Unable to complete reputation comparison",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSearching(false);
      setSearchProgress(0);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setShowDemoMode(false);
    setIsComparing(false);
    setComparisonData(null);
    setShowResults(false);
    setHasSearched(false);
    setCurrentKeyword("");
    setSearchResults([]);
    setHistoricalData([]);
  };

  // Calculate score based on inputs using centralized logic
  useEffect(() => {
    const calculateScore = () => {
      // Map activeTab to entityType
      let entityType: EntityType;
      if (activeTab === 2) {
        entityType = "public-figure";
      } else if (activeTab === 1) {
        entityType = "company";
      } else {
        entityType = "individual";
      }

      // Add geoPresence with default value if missing
      const dataWithGeo = {
        ...scoreData,
        geoPresence: scoreData.geoPresence || 0,
      };

      const score = calculateScoreFromLegacyData(dataWithGeo, entityType);
      setCurrentScore(score);
    };

    calculateScore();
  }, [scoreData, activeTab]);

  return (
    <Box py={8}>
      {/* User Welcome Banner */}
      {user?.name && showWelcomeBanner && (
        <WelcomeBanner
          userName={user.name || user.email || ""}
          onDismiss={() => setShowWelcomeBanner(false)}
        />
      )}

      {/* Animated Step Container */}
      <AnimatePresence mode="wait">
        {/* Step 1: Search Form */}
        {currentStep === 1 && (
          <div key="step1">
            <SearchSection
              onSearch={handleSearch}
              onCompare={handleCompare}
              onDemo={handleDemoMode}
              isSearching={isSearching}
              searchProgress={searchProgress}
            />
          </div>
        )}

        {/* Step 2: Analyzing State */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Box
              bg="white"
              rounded="xl"
              shadow="lg"
              border="1px"
              borderColor="gray.200"
              p={8}
              mb={8}
              mx={6}
              textAlign="center"
            >
              <VStack spacing={6}>
                <motion.div
                  variants={bounceVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                    Analyzing Reputation
                  </Text>
                </motion.div>
                <motion.div
                  variants={bounceVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.2 }}
                >
                  <Text color="gray.600">
                    Please wait while we gather and analyze data about{" "}
                    {currentKeyword}...
                  </Text>
                </motion.div>

                <motion.div
                  variants={bounceVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.4 }}
                  style={{ width: "100%", maxWidth: "400px" }}
                >
                  <Box w="100%" maxW="400px">
                    <Progress
                      value={searchProgress}
                      colorScheme="teal"
                      size="lg"
                      rounded="full"
                      hasStripe
                      isAnimated
                    />
                    <Text
                      textAlign="center"
                      fontSize="sm"
                      color="gray.600"
                      mt={2}
                    >
                      {searchProgress < 20 && "Gathering data..."}
                      {searchProgress >= 20 &&
                        searchProgress < 40 &&
                        "Analyzing sources..."}
                      {searchProgress >= 40 &&
                        searchProgress < 60 &&
                        "Processing sentiment..."}
                      {searchProgress >= 60 &&
                        searchProgress < 80 &&
                        "Calculating score..."}
                      {searchProgress >= 80 &&
                        searchProgress < 100 &&
                        "Finalizing results..."}
                      {searchProgress === 100 && "Complete!"}
                    </Text>
                  </Box>
                </motion.div>
              </VStack>
            </Box>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header with reset option */}
            <motion.div
              variants={bounceVariants}
              initial="initial"
              animate="animate"
            >
              <HStack justify="space-between" mx={6} mb={6}>
                <Text fontSize="xl" fontWeight="bold" color="gray.900">
                  {showDemoMode
                    ? "Demo Results"
                    : `Analysis Results for "${currentKeyword}"`}
                </Text>
                <Button
                  variant="outline"
                  colorScheme="teal"
                  onClick={handleReset}
                  size="sm"
                >
                  New Analysis
                </Button>
              </HStack>
            </motion.div>

            {/* Comparison View */}
            {isComparing && comparisonData && (
              <motion.div
                variants={bounceVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.2 }}
              >
                <ComparisonView
                  entity1={comparisonData.entity1}
                  entity2={comparisonData.entity2}
                  type={comparisonData.type}
                  onClose={handleReset}
                />
              </motion.div>
            )}

            {/* Score Overview - Prominently displayed */}
            {!isComparing && (
              <motion.div
                variants={bounceVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.2 }}
              >
                <Flex
                  direction={{ base: "column", lg: "row" }}
                  gap={8}
                  mx={6}
                  mb={8}
                >
                  {/* Score Overview */}
                  <Box flex="1">
                    <ScoreOverview
                      score={currentScore}
                      type={entityTypes[activeTab]}
                      keyword={currentKeyword}
                      hasSearched={hasSearched || showDemoMode}
                      historicalData={historicalData}
                    />
                  </Box>

                  {/* Score Breakdown */}
                  <Box flex="2">
                    <ScoreBreakdown
                      scoreData={scoreData}
                      setScoreData={setScoreData}
                      type={entityTypes[activeTab]}
                    />
                  </Box>
                </Flex>
              </motion.div>
            )}

            {/* Low Result Alert */}
            {lowResultAlert?.isLowCount && (
              <motion.div
                variants={bounceVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.25 }}
              >
                <Box mx={6} mb={6}>
                  <Alert status="warning" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="semibold" mb={2}>
                        {lowResultAlert.message}
                      </Text>
                      {lowResultAlert.suggestions && (
                        <Box>
                          <Text fontSize="sm" mb={2}>
                            Suggestions to improve your online presence:
                          </Text>
                          <VStack align="start" fontSize="sm" spacing={1}>
                            {lowResultAlert.suggestions.map(
                              (suggestion, index) => (
                                <Text key={index}>• {suggestion}</Text>
                              ),
                            )}
                          </VStack>
                        </Box>
                      )}
                    </Box>
                  </Alert>
                </Box>
              </motion.div>
            )}

            {/* Search Results */}
            {!isComparing && (
              <motion.div
                variants={bounceVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
              >
                <SearchResults
                  keyword={currentKeyword}
                  results={searchResults}
                  isVisible={showResults || showDemoMode}
                  entityType={entityTypes[activeTab]}
                  originalScoreData={scoreData}
                  onScoreUpdate={handleScoreUpdate}
                />
              </motion.div>
            )}

            {/* Action Items - Show after search results */}
            {(showResults || showDemoMode) && (
              <motion.div
                variants={bounceVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
              >
                <Box mx={6}>
                  <ReputationActionItems
                    score={currentScore}
                    type={entityTypes[activeTab]}
                    data={scoreData}
                  />
                </Box>
              </motion.div>
            )}

            {/* Score Breakdown Charts - Show after action items */}
            {(showResults || showDemoMode) && (
              <motion.div
                variants={bounceVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.4 }}
              >
                <Box mx={6} mt={6}>
                  <ReputationScoreBreakdown
                    scoreData={scoreData}
                    type={entityTypes[activeTab]}
                  />
                </Box>
              </motion.div>
            )}

            {/* Historical Chart */}
            {!isComparing && (
              <motion.div
                variants={bounceVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.5 }}
              >
                <Box mx={6}>
                  {historicalData.length > 1 ? (
                    <HistoricalChart data={historicalData} />
                  ) : (
                    <Box
                      bg="white"
                      rounded="xl"
                      shadow="sm"
                      border="1px"
                      borderColor="gray.200"
                      p={6}
                    >
                      <VStack py={12} textAlign="center">
                        <Box
                          w={16}
                          h={16}
                          bg="blue.100"
                          rounded="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          mb={4}
                        >
                          <Text fontSize="2xl" color="blue.600">
                            📈
                          </Text>
                        </Box>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.900"
                          mb={2}
                        >
                          {showDemoMode
                            ? "Demo Chart Placeholder"
                            : "Building Your Score History"}
                        </Text>
                        <Text color="gray.600" mb={4}>
                          {showDemoMode
                            ? "This is where your historical reputation trends would appear with real data."
                            : "Your reputation trend will appear here after we collect more data points over time."}
                        </Text>
                        <Alert
                          status={showDemoMode ? "warning" : "info"}
                          maxW="md"
                        >
                          <AlertIcon />
                          <Text fontSize="sm">
                            {showDemoMode
                              ? "Run a real analysis to start building your reputation history."
                              : "Check back weekly to see your reputation trend develop and track your progress."}
                          </Text>
                        </Alert>
                      </VStack>
                    </Box>
                  )}
                </Box>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
