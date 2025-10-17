import { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Progress,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Spinner,
  useToast,
  Select,
  Radio,
  RadioGroup,
  Grid,
  GridItem,
  Textarea,
} from "@chakra-ui/react";
import { useUser } from "@auth0/nextjs-auth0/client";

const BRAND_INTENT_CATEGORIES = [
  {
    value: "general_overview",
    label: "General Overview",
    prompt: "What is [Brand Name]? Tell me about [Brand Name]",
  },
  { value: "ownership", label: "Ownership", prompt: "Who owns [Brand Name]?" },
  {
    value: "founding_history",
    label: "Founding & History",
    prompt:
      "Who founded [Brand Name] and when? What's the story behind [Brand Name]?",
  },
  {
    value: "leadership",
    label: "Leadership",
    prompt: "Who is the CEO of [Brand Name]?",
  },
  {
    value: "reputation",
    label: "Reputation",
    prompt:
      "Does [Brand Name] have a good reputation? What do people think of [Brand Name]?",
  },
  {
    value: "product_service",
    label: "Product / Service Details",
    prompt: "What does [Brand Name] do? What products does [Brand Name] offer?",
  },
  {
    value: "industry_context",
    label: "Industry Context",
    prompt:
      "How does [Brand Name] compare to competitors? What makes [Brand Name] different?",
  },
  {
    value: "news_controversy",
    label: "News & Controversy",
    prompt:
      "Has [Brand Name] been in the news recently? What controversies has [Brand Name] been involved in?",
  },
  {
    value: "reviews_opinion",
    label: "Reviews / Public Opinion",
    prompt:
      "What are people saying about [Brand Name]? Customer reviews for [Brand Name]?",
  },
  {
    value: "funding_investors",
    label: "Funding / Investors",
    prompt: "Who has invested in [Brand Name]? Is [Brand Name] VC-backed?",
  },
  {
    value: "employment_culture",
    label: "Employment / Culture",
    prompt:
      "Is [Brand Name] a good company to work for? What's the culture at [Brand Name]?",
  },
  {
    value: "legitimacy_scam",
    label: "Legitimacy / Scam Check",
    prompt: "Is [Brand Name] legit or a scam?",
  },
];

const INDIVIDUAL_INTENT_CATEGORIES = [
  {
    value: "general_overview",
    label: "General Overview",
    prompt: "Who is [Full Name]?",
  },
  {
    value: "background",
    label: "Background",
    prompt: "What is [Full Name] known for? What does [Full Name] do?",
  },
  {
    value: "reputation",
    label: "Reputation",
    prompt:
      "Does [Full Name] have a good reputation? What do people say about [Full Name]?",
  },
  {
    value: "employment_leadership",
    label: "Employment / Leadership",
    prompt:
      "What is [Full Name]'s role at their company? Is [Full Name] the CEO of their company?",
  },
  {
    value: "notable_events",
    label: "Notable Events",
    prompt:
      "Has [Full Name] been in the news recently? What is [Full Name] best known for?",
  },
  {
    value: "net_worth_influence",
    label: "Net Worth / Influence",
    prompt: "What is [Full Name]'s net worth? How influential is [Full Name]?",
  },
  {
    value: "social_media",
    label: "Social Media Presence",
    prompt: "Where can I find [Full Name] online?",
  },
  {
    value: "education_credentials",
    label: "Education / Credentials",
    prompt:
      "Where did [Full Name] go to school? What is [Full Name]'s background?",
  },
  {
    value: "affiliation",
    label: "Affiliation",
    prompt: "Is [Full Name] affiliated with any organization?",
  },
  {
    value: "legal_controversy",
    label: "Legal / Controversy",
    prompt: "Has [Full Name] been involved in any controversies?",
  },
];

interface GEOFormData {
  keyword: string;
  analysisType: "brand" | "individual";
  intentCategory: string;
  customPrompt: string;
}

interface GEOResult {
  results: Array<{
    source: string;
    content: string;
    sentiment?: string;
    [key: string]: any;
  }>;
  keyword: string;
  analysisId?: string;
  aggregatedInsights?: {
    overallSentiment?: string;
    [key: string]: any;
  };
  metadata?: {
    analysisType?: string;
    [key: string]: any;
  };
  success?: boolean;
  message?: string;
  error?: string;
}

function GEOCheck() {
  const { user, isLoading } = useUser();
  const toast = useToast();

  const [formData, setFormData] = useState<GEOFormData>({
    keyword: user?.name || "",
    analysisType: "individual",
    intentCategory: "",
    customPrompt: "",
  });

  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GEOResult | null>(null);

  // Update keyword default when user loads
  useEffect(() => {
    if (user?.name && !formData.keyword) {
      setFormData((prev) => ({ ...prev, keyword: user.name || "" }));
    }
  }, [user, formData.keyword]);

  // Generate prompt based on selected category and keyword
  const generatePromptPreview = () => {
    if (!formData.intentCategory || !formData.keyword.trim()) return "";

    const categories =
      formData.analysisType === "brand"
        ? BRAND_INTENT_CATEGORIES
        : INDIVIDUAL_INTENT_CATEGORIES;
    const category = categories.find(
      (cat) => cat.value === formData.intentCategory
    );

    if (!category) return "";

    let prompt = category.prompt;

    // Replace placeholders with actual keyword
    if (formData.analysisType === "brand") {
      prompt = prompt.replace(/\[Brand Name\]/g, formData.keyword.trim());
    } else {
      prompt = prompt.replace(/\[Full Name\]/g, formData.keyword.trim());
    }

    // Add instruction for sources
    prompt += " Include any links to sources.";

    return prompt;
  };

  // Update custom prompt when intent category or keyword changes
  useEffect(() => {
    const newPrompt = generatePromptPreview();
    if (newPrompt && newPrompt !== formData.customPrompt) {
      setFormData((prev) => ({ ...prev, customPrompt: newPrompt }));
    }
  }, [
    formData.intentCategory,
    formData.keyword,
    formData.analysisType,
    formData.customPrompt,
  ]);

  // Enhanced loading states with playful messages
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingVerb, setLoadingVerb] = useState("");

  const loadingVerbs = [
    "Analyzing",
    "Processing",
    "Scanning",
    "Investigating",
    "Examining",
    "Evaluating",
    "Exploring",
    "Discovering",
    "Researching",
    "Calculating",
    "Synthesizing",
    "Cross-referencing",
    "Correlating",
    "Interpreting",
    "Decoding",
  ];

  const loadingMessages = [
    "Querying AI engines across the web...",
    "Gathering intelligence from multiple sources...",
    "Cross-referencing data points...",
    "Analyzing sentiment patterns...",
    "Compiling comprehensive insights...",
    "Synthesizing multi-engine responses...",
    "Performing deep context analysis...",
    "Validating information accuracy...",
    "Generating aggregated insights...",
    "Finalizing comprehensive report...",
  ];

  const simulateProgress = () => {
    setProgress(0);
    setLoadingMessage(loadingMessages[0]);
    setLoadingVerb(loadingVerbs[0]);

    // More realistic progress for 30+ second operation
    // Stop at 95% to avoid getting stuck at 100% before API completes
    const steps = [8, 16, 28, 45, 62, 75, 85, 92, 95];
    const delays = [1000, 2000, 3000, 4000, 5000, 6000, 4000, 3000, 2000];

    steps.forEach((step, index) => {
      setTimeout(
        () => {
          setProgress(step);
          if (index < loadingMessages.length) {
            setLoadingMessage(loadingMessages[index]);
          }

          // Rotate through verbs more frequently for animation
          const verbIndex = Math.floor(Math.random() * loadingVerbs.length);
          setLoadingVerb(loadingVerbs[verbIndex]);
        },
        delays.slice(0, index + 1).reduce((sum, delay) => sum + delay, 0)
      );
    });

    // Additional verb rotation during long waits
    const verbInterval = setInterval(() => {
      if (progress < 100 && isChecking) {
        const verbIndex = Math.floor(Math.random() * loadingVerbs.length);
        setLoadingVerb(loadingVerbs[verbIndex]);
      } else {
        clearInterval(verbInterval);
      }
    }, 2000);

    // Store interval ID to clear it later
    return verbInterval;
  };

  const handleGEOCheck = async () => {
    if (!formData.keyword.trim() || !formData.intentCategory) return;

    setIsChecking(true);
    setResults(null);
    const verbInterval = simulateProgress();

    try {
      // Call the secure internal GEO analysis endpoint
      const response = await fetch("/api/geo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: formData.keyword.trim(),
          analysisType: formData.analysisType,
          intentCategory: formData.intentCategory,
          customPrompt: formData.customPrompt,
        }),
      });

      if (!response.ok) throw new Error("GEO check failed");

      const result: GEOResult = await response.json();

      // Complete the progress and show results
      setProgress(100);
      setLoadingMessage("Analysis complete!");
      setLoadingVerb("Completed");

      // Small delay to show completion, then clear loading and show results
      setTimeout(() => {
        clearInterval(verbInterval);
        setResults(result);
        setIsChecking(false);
        setProgress(0);
        setLoadingMessage("");
        setLoadingVerb("");
      }, 800);

      toast({
        title: "GEO Analysis Complete",
        description: result.message || "Analysis completed successfully",
        status: result.success ? "success" : "warning",
        duration: 5000,
      });
    } catch (error) {
      console.error("GEO check failed:", error);
      clearInterval(verbInterval);
      toast({
        title: "GEO Analysis Failed",
        description: "Unable to complete GEO analysis. Please try again.",
        status: "error",
        duration: 5000,
      });
      setIsChecking(false);
      setProgress(0);
      setLoadingMessage("");
      setLoadingVerb("");
    }
  };

  const isFormValid = () => {
    return (
      formData.keyword.trim() &&
      formData.intentCategory &&
      formData.customPrompt.trim()
    );
  };

  if (isLoading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text>Loading...</Text>
        </VStack>
      </Container>
    );
  }

  if (!user || !user.isAuthenticated) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={6} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold">
            Sign in to access GEO Analysis
          </Text>
          <Text color="gray.600">
            Run comprehensive GEO analysis to understand how AI-powered search
            engines perceive and present information about your brand or name.
          </Text>
          <Button as="a" href="/api/auth/login" colorScheme="teal" size="lg">
            Sign In
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" color="gray.900" mb={4}>
            GEO Analysis
          </Text>
          <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
            Run comprehensive GEO (Generative Engine Optimization) analysis to
            understand how AI-powered search engines perceive and present
            information about your brand or name.
          </Text>
        </Box>

        {/* Analysis Form */}
        <Card>
          <CardHeader>
            <Text fontSize="xl" fontWeight="semibold">
              GEO Analysis Configuration
            </Text>
          </CardHeader>
          <CardBody>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={6}
            >
              {/* Keyword Field */}
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl isRequired>
                  <FormLabel>Search Term/Keyword</FormLabel>
                  <Input
                    placeholder="Enter name or brand to analyze"
                    value={formData.keyword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        keyword: e.target.value,
                      }))
                    }
                    size="lg"
                    isDisabled={isChecking}
                  />
                </FormControl>
              </GridItem>

              {/* Analysis Type */}
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Analysis Type</FormLabel>
                  <RadioGroup
                    value={formData.analysisType}
                    onChange={(value: "brand" | "individual") =>
                      setFormData((prev) => ({
                        ...prev,
                        analysisType: value,
                        intentCategory: "", // Reset intent when changing type
                      }))
                    }
                    isDisabled={isChecking}
                  >
                    <HStack spacing={6}>
                      <Radio value="individual">Individual</Radio>
                      <Radio value="brand">Brand</Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
              </GridItem>

              {/* Intent Category */}
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Intent Category</FormLabel>
                  <Select
                    placeholder="Select analysis intent"
                    value={formData.intentCategory}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        intentCategory: e.target.value,
                      }))
                    }
                    isDisabled={isChecking}
                  >
                    {(formData.analysisType === "brand"
                      ? BRAND_INTENT_CATEGORIES
                      : INDIVIDUAL_INTENT_CATEGORIES
                    ).map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              {/* Custom Prompt */}
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl>
                  <FormLabel>Analysis Prompt</FormLabel>
                  <Textarea
                    placeholder="Select an intent category above to generate a prompt, or write your own custom prompt"
                    value={formData.customPrompt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customPrompt: e.target.value,
                      }))
                    }
                    rows={4}
                    fontSize="sm"
                    fontFamily="mono"
                    isDisabled={isChecking}
                  />
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    This prompt will be sent to AI engines for analysis.
                    Auto-updates when you change selections above.
                  </Text>
                </FormControl>
              </GridItem>
            </Grid>

            {/* Submit Button */}
            <Box mt={6} textAlign="center">
              <Button
                colorScheme="teal"
                size="lg"
                onClick={handleGEOCheck}
                isDisabled={!isFormValid() || isChecking}
                isLoading={isChecking}
                loadingText="Running Analysis..."
                px={10}
              >
                Run GEO Analysis
              </Button>
            </Box>

            {/* Enhanced Progress Display */}
            {isChecking && (
              <Box mt={6}>
                {/* Animated Header */}
                <VStack spacing={3} mb={6}>
                  <HStack spacing={3} justify="center" align="center">
                    <Box
                      as="div"
                      animation="spin 2s linear infinite"
                      w={6}
                      h={6}
                      border="2px solid"
                      borderColor="teal.200"
                      borderTopColor="teal.500"
                      borderRadius="full"
                    />
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color="teal.600"
                      key={loadingVerb} // Key change triggers re-render animation
                      animation="fadeIn 0.5s ease-in-out"
                    >
                      {loadingVerb}...
                    </Text>
                  </HStack>

                  <Text
                    textAlign="center"
                    fontSize="md"
                    color="gray.600"
                    key={loadingMessage} // Key change triggers re-render animation
                  >
                    {loadingMessage}
                  </Text>
                </VStack>

                {/* Progress Bar */}
                <Box mb={4}>
                  <Progress
                    value={progress}
                    colorScheme="teal"
                    size="lg"
                    rounded="full"
                    hasStripe
                    isAnimated
                    bg="teal.50"
                  />
                </Box>

                {/* Progress Stats */}
                <HStack justify="space-between" fontSize="sm" color="gray.500">
                  <Text>{Math.round(progress)}% complete</Text>
                  <Text>
                    {progress < 50
                      ? "Usually takes 20-30 seconds"
                      : progress < 90
                        ? "Almost there..."
                        : "Just a few more moments..."}
                  </Text>
                </HStack>

                {/* Tip Box */}
                {progress > 30 && progress < 90 && (
                  <Box
                    mt={6}
                    p={4}
                    bg="blue.50"
                    rounded="lg"
                    border="1px"
                    borderColor="blue.200"
                    animation="slideIn 0.5s ease-out"
                  >
                    <Text fontSize="sm" color="blue.700" textAlign="center">
                      💡 <strong>Pro tip:</strong> We&apos;re analyzing
                      responses from multiple AI engines including GPT-5,
                      Claude, Gemini, and more to give you the most
                      comprehensive insights.
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Results */}
        {results && (
          <Card>
            <CardHeader>
              <Text fontSize="xl" fontWeight="semibold">
                Analysis Results
              </Text>
            </CardHeader>
            <CardBody>
              {results.success ? (
                <VStack spacing={6} align="stretch">
                  <Alert status="success">
                    <AlertIcon />
                    <Text>
                      {results.message || "Analysis completed successfully!"}
                    </Text>
                  </Alert>

                  {results.results && results.results.length > 0 && (
                    <VStack spacing={4} align="stretch">
                      {/* Analysis Overview */}
                      <Box>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          mb={3}
                          color="gray.900"
                        >
                          Analysis Overview
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Card size="sm">
                            <CardBody>
                              <Text fontSize="sm" color="gray.600">
                                Keyword
                              </Text>
                              <Text fontWeight="bold">{results.keyword}</Text>
                            </CardBody>
                          </Card>
                          <Card size="sm">
                            <CardBody>
                              <Text fontSize="sm" color="gray.600">
                                Engines Used
                              </Text>
                              <Text fontWeight="bold">
                                {results.results.length}
                              </Text>
                            </CardBody>
                          </Card>
                          <Card size="sm">
                            <CardBody>
                              <Text fontSize="sm" color="gray.600">
                                Analysis Type
                              </Text>
                              <Text
                                fontWeight="bold"
                                textTransform="capitalize"
                              >
                                {results.metadata?.analysisType || "Unknown"}
                              </Text>
                            </CardBody>
                          </Card>
                        </SimpleGrid>
                      </Box>

                      {/* AI Engine Responses */}
                      <Box>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          mb={3}
                          color="gray.900"
                        >
                          AI Engine Responses ({results.results.length})
                        </Text>
                        <VStack spacing={4} align="stretch">
                          {results.results.map((result: any, index: number) => (
                            <Box
                              key={index}
                              p={4}
                              bg="gray.50"
                              rounded="md"
                              border="1px"
                              borderColor="gray.200"
                            >
                              <HStack justify="space-between" mb={3}>
                                <Badge
                                  colorScheme="purple"
                                  variant="subtle"
                                  fontSize="sm"
                                >
                                  {result.engine || `Engine ${index + 1}`}
                                </Badge>
                                <Badge
                                  colorScheme={result.error ? "red" : "green"}
                                  variant="outline"
                                  fontSize="xs"
                                >
                                  {result.error ? "Error" : "Success"}
                                </Badge>
                              </HStack>

                              {result.error ? (
                                <Alert status="warning" size="sm">
                                  <AlertIcon />
                                  <Text fontSize="sm">{result.error}</Text>
                                </Alert>
                              ) : (
                                <>
                                  <Text
                                    color="gray.700"
                                    whiteSpace="pre-wrap"
                                    fontSize="sm"
                                    lineHeight="1.6"
                                  >
                                    {result.summary ||
                                      result.response ||
                                      result.content ||
                                      "No response content"}
                                  </Text>

                                  {result.sources &&
                                    result.sources.length > 0 && (
                                      <Box
                                        mt={4}
                                        pt={3}
                                        borderTop="1px"
                                        borderColor="gray.300"
                                      >
                                        <Text
                                          fontSize="xs"
                                          fontWeight="medium"
                                          color="gray.600"
                                          mb={2}
                                        >
                                          Sources ({result.sources.length}):
                                        </Text>
                                        <VStack spacing={1} align="stretch">
                                          {result.sources.map(
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
                                                <Text
                                                  as="span"
                                                  textDecoration="underline"
                                                  cursor="pointer"
                                                >
                                                  {typeof source === "string"
                                                    ? source
                                                    : source.url ||
                                                      source.title ||
                                                      "Source"}
                                                </Text>
                                              </Text>
                                            )
                                          )}
                                        </VStack>
                                      </Box>
                                    )}
                                </>
                              )}
                            </Box>
                          ))}
                        </VStack>
                      </Box>

                      {/* Aggregated Insights */}
                      {results.aggregatedInsights && (
                        <Box>
                          <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            mb={3}
                            color="gray.900"
                          >
                            Aggregated Insights
                          </Text>
                          <Box
                            p={4}
                            bg="blue.50"
                            rounded="md"
                            border="1px"
                            borderColor="blue.200"
                          >
                            <VStack spacing={3} align="stretch">
                              {results.aggregatedInsights.overallSentiment && (
                                <Text fontSize="sm">
                                  <Text as="span" fontWeight="medium">
                                    Overall Sentiment:
                                  </Text>{" "}
                                  {results.aggregatedInsights.overallSentiment}
                                </Text>
                              )}

                              {results.aggregatedInsights.commonInsights &&
                                results.aggregatedInsights.commonInsights
                                  .length > 0 && (
                                  <Box>
                                    <Text
                                      fontSize="sm"
                                      fontWeight="medium"
                                      mb={1}
                                    >
                                      Common Insights:
                                    </Text>
                                    {results.aggregatedInsights.commonInsights.map(
                                      (insight: string, idx: number) => (
                                        <Text
                                          key={idx}
                                          fontSize="xs"
                                          color="gray.700"
                                        >
                                          • {insight}
                                        </Text>
                                      )
                                    )}
                                  </Box>
                                )}

                              {results.aggregatedInsights.topTags &&
                                results.aggregatedInsights.topTags.length >
                                  0 && (
                                  <Box>
                                    <Text
                                      fontSize="sm"
                                      fontWeight="medium"
                                      mb={2}
                                    >
                                      Top Tags:
                                    </Text>
                                    <HStack spacing={2} flexWrap="wrap">
                                      {results.aggregatedInsights.topTags
                                        .slice(0, 10)
                                        .map((tag: any, idx: number) => (
                                          <Badge
                                            key={idx}
                                            colorScheme="gray"
                                            variant="subtle"
                                            fontSize="xs"
                                          >
                                            {tag.tag} ({tag.count})
                                          </Badge>
                                        ))}
                                    </HStack>
                                  </Box>
                                )}
                            </VStack>
                          </Box>
                        </Box>
                      )}

                      {/* Raw Data (Collapsed) */}
                      <Box>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          mb={3}
                          color="gray.900"
                        >
                          Raw Response Data
                        </Text>
                        <Box
                          p={4}
                          bg="gray.50"
                          rounded="md"
                          border="1px"
                          borderColor="gray.200"
                          maxH="300px"
                          overflowY="auto"
                        >
                          <Text
                            fontSize="xs"
                            fontFamily="mono"
                            whiteSpace="pre-wrap"
                            color="gray.600"
                          >
                            {JSON.stringify(results, null, 2)}
                          </Text>
                        </Box>
                      </Box>
                    </VStack>
                  )}
                </VStack>
              ) : (
                <Alert status="error">
                  <AlertIcon />
                  <Text>
                    {results.error || "Analysis failed. Please try again."}
                  </Text>
                </Alert>
              )}
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
}

export default GEOCheck;
