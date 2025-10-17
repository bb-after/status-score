import { useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Progress,
  useColorModeValue,
  Icon,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaSearch, FaBalanceScale, FaSpinner, FaInfoCircle, FaGift } from "react-icons/fa";

interface SearchSectionProps {
  onSearch: (
    keyword: string,
    type: "individual" | "company" | "public-figure"
  ) => void;
  onCompare: (
    keyword1: string,
    keyword2: string,
    type: "individual" | "company" | "public-figure"
  ) => void;
  onDemo?: () => void;
  isSearching: boolean;
  searchProgress: number;
}

export function SearchSection({
  onSearch,
  onCompare,
  onDemo,
  isSearching,
  searchProgress,
}: SearchSectionProps) {
  const [searchMode, setSearchMode] = useState<"search" | "compare">("search");
  const [keyword, setKeyword] = useState("");
  const [keyword1, setKeyword1] = useState("");
  const [keyword2, setKeyword2] = useState("");
  const [entityType, setEntityType] = useState<
    "individual" | "company" | "public-figure"
  >("individual");

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Progress steps with stats
  const progressSteps = useMemo(() => [
    {
      message: "Searching Google for top 20 results...",
      stat: "90% of people research online before making decisions",
      progress: 20
    },
    {
      message: "Analyzing sentiment and content quality...",
      stat: "A single negative result can cost 22% of potential customers",
      progress: 40
    },
    {
      message: "Checking Wikipedia and authority sites...",
      stat: "75% of people never scroll past the first page of search results",
      progress: 60
    },
    {
      message: "Evaluating social media presence...",
      stat: "Online reputation influences 93% of consumer decisions",
      progress: 80
    },
    {
      message: "Generating comprehensive reputation score...",
      stat: "Companies with positive online reputation see 31% higher profits",
      progress: 100
    }
  ], []);

  const getCurrentStep = () => {
    return progressSteps.find(step => searchProgress <= step.progress) || progressSteps[progressSteps.length - 1];
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (searchMode === "search" && keyword.trim()) {
      onSearch(keyword.trim(), entityType);
    } else if (searchMode === "compare" && keyword1.trim() && keyword2.trim()) {
      onCompare && onCompare(keyword1.trim(), keyword2.trim(), entityType);
    }
  };

  const canSearch =
    searchMode === "search"
      ? keyword.trim().length > 0
      : keyword1.trim().length > 0 && keyword2.trim().length > 0;

  const currentStep = getCurrentStep();

  return (
    <Box
      bg={bgColor}
      rounded="xl"
      shadow="sm"
      border="1px"
      borderColor={borderColor}
      p={6}
      mb={6}
    >
      {/* Header */}
      <HStack justify="space-between" align="flex-start" mb={4}>
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bgGradient="linear(to-r, teal.500, cyan.400)"
            rounded="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon
              as={searchMode === "compare" ? FaBalanceScale : FaSearch}
              color="white"
              boxSize={4}
            />
          </Box>
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              {searchMode === "compare" ? "Reputation Comparison" : "Reputation Search"}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {searchMode === "compare"
                ? "Compare two entities side-by-side (Free: up to 2 comparisons)"
                : "Enter a name or company to analyze their online reputation"
              }
            </Text>
          </VStack>
        </HStack>

        {/* Mode Toggle Buttons */}
        <HStack spacing={2}>
          <Button
            size="sm"
            bg={!searchMode || searchMode === "search" ? "teal.100" : "transparent"}
            color={!searchMode || searchMode === "search" ? "teal.700" : "gray.600"}
            _hover={{
              bg: !searchMode || searchMode === "search" ? "teal.100" : "gray.50",
              color: "gray.900"
            }}
            onClick={() => setSearchMode("search")}
            leftIcon={<Icon as={FaSearch} />}
            fontSize="sm"
            fontWeight="medium"
          >
            Single Analysis
          </Button>
          <Button
            size="sm"
            bg={searchMode === "compare" ? "teal.100" : "transparent"}
            color={searchMode === "compare" ? "teal.700" : "gray.600"}
            _hover={{
              bg: searchMode === "compare" ? "teal.100" : "gray.50",
              color: "gray.900"
            }}
            onClick={() => setSearchMode("compare")}
            leftIcon={<Icon as={FaBalanceScale} />}
            fontSize="sm"
            fontWeight="medium"
          >
            Compare
            <Box
              as="span"
              ml={1}
              px={1.5}
              py={0.5}
              bg="green.100"
              color="green.700"
              fontSize="xs"
              rounded="full"
            >
              FREE
            </Box>
          </Button>
        </HStack>
      </HStack>

      {/* Progress Bar - Show when searching */}
      {isSearching && (
        <Box
          mb={6}
          p={4}
          bgGradient="linear(to-r, teal.50, cyan.50)"
          rounded="lg"
          border="1px"
          borderColor="teal.100"
        >
          <HStack justify="space-between" mb={3}>
            <HStack spacing={2}>
              <Icon as={FaSpinner} className="animate-spin" color="teal.600" />
              <Text fontSize="sm" fontWeight="medium" color="teal.800">
                {currentStep.message}
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="bold" color="teal.700">
              {Math.round(searchProgress)}%
            </Text>
          </HStack>

          <Progress
            value={searchProgress}
            size="sm"
            colorScheme="teal"
            rounded="full"
            mb={3}
            bg="teal.200"
          />

          <HStack spacing={2} color="teal.700">
            <Icon as={FaInfoCircle} fontSize="sm" />
            <Text fontSize="sm" fontWeight="medium">
              {currentStep.stat}
            </Text>
          </HStack>
        </Box>
      )}

      {/* Search Form */}
      <Box as="form" onSubmit={handleSearch}>
        <VStack spacing={4}>
          {/* Search Inputs */}
          {searchMode === "compare" ? (
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} w="100%">
              <GridItem>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  First Entity
                </Text>
                <Input
                  value={keyword1}
                  onChange={(e) => setKeyword1(e.target.value)}
                  placeholder="Enter first name or company..."
                  size="lg"
                  border="1px"
                  borderColor="gray.300"
                  rounded="lg"
                  _focus={{
                    ring: 2,
                    ringColor: "teal.500",
                    borderColor: "transparent",
                  }}
                  isDisabled={isSearching}
                />
              </GridItem>
              <GridItem>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
                  Second Entity
                </Text>
                <Input
                  value={keyword2}
                  onChange={(e) => setKeyword2(e.target.value)}
                  placeholder="Enter second name or company..."
                  size="lg"
                  border="1px"
                  borderColor="gray.300"
                  rounded="lg"
                  _focus={{
                    ring: 2,
                    ringColor: "teal.500",
                    borderColor: "transparent",
                  }}
                  isDisabled={isSearching}
                  onKeyPress={(e) => e.key === "Enter" && canSearch && handleSearch()}
                />
              </GridItem>
            </Grid>
          ) : (
            <HStack spacing={4} w="100%">
              <Input
                flex={1}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter name or company..."
                size="lg"
                border="1px"
                borderColor="gray.300"
                rounded="lg"
                _focus={{
                  ring: 2,
                  ringColor: "teal.500",
                  borderColor: "transparent",
                }}
                isDisabled={isSearching}
                onKeyPress={(e) => e.key === "Enter" && canSearch && handleSearch()}
              />
            </HStack>
          )}

          {/* Entity Type & Submit */}
          <HStack justify="space-between" align="center" w="100%">
            {/* Entity Type Selector */}
            <HStack bg="gray.100" rounded="lg" p={1}>
              {(["individual", "company", "public-figure"] as const).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  bg={entityType === type ? "white" : "transparent"}
                  color={entityType === type ? "gray.900" : "gray.600"}
                  shadow={entityType === type ? "sm" : "none"}
                  _hover={{
                    color: "gray.900",
                  }}
                  onClick={() => setEntityType(type)}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  {type === "public-figure" ? "Public Figure" : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </HStack>

            {searchMode === "compare" && (
              <HStack
                fontSize="sm"
                color="gray.600"
                bg="blue.50"
                px={3}
                py={2}
                rounded="lg"
              >
                <Icon as={FaGift} color="blue.600" />
                <Text>Free: Compare up to 2 entities</Text>
              </HStack>
            )}
          </HStack>

          {/* Submit Button */}
          <Button
            type="submit"
            w="100%"
            bgGradient="linear(to-r, teal.600, cyan.500)"
            color="white"
            size="lg"
            fontWeight="medium"
            _hover={{
              bgGradient: "linear(to-r, teal.700, cyan.600)",
            }}
            isDisabled={!canSearch || isSearching}
            isLoading={isSearching}
            loadingText={searchMode === "compare" ? "Comparing Reputations..." : "Analyzing Reputation..."}
            leftIcon={
              isSearching ? (
                <Icon as={FaSpinner} className="animate-spin" />
              ) : (
                <Icon as={searchMode === "compare" ? FaBalanceScale : FaSearch} />
              )
            }
          >
            {searchMode === "compare" ? "Compare Reputations" : "Analyze Reputation"}
          </Button>
        </VStack>
      </Box>

      {/* Info Panel */}
      <Box mt={4} p={4} bg="blue.50" rounded="lg">
        <HStack align="flex-start" spacing={3}>
          <Icon as={FaInfoCircle} color="blue.600" mt={0.5} />
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="sm" color="blue.800" fontWeight="medium">
              {searchMode === "compare" ? "Comparison Features:" : "How it works:"}
            </Text>
            <VStack align="flex-start" spacing={1} color="blue.700" fontSize="sm">
              {searchMode === "compare" ? (
                <>
                  <Text>• Side-by-side reputation score comparison</Text>
                  <Text>• Detailed breakdown of each factor</Text>
                  <Text>• Visual charts showing strengths and weaknesses</Text>
                  <Text>• Free: Compare up to 2 entities</Text>
                  <Text>
                    • <Text as="span" fontWeight="medium">Premium:</Text> Compare 3+ entities, weekly email reports
                  </Text>
                </>
              ) : (
                <>
                  <Text>• Searches Google for the top 20 results</Text>
                  <Text>• Analyzes sentiment and content quality</Text>
                  <Text>• Checks Wikipedia, social media, and news coverage</Text>
                  <Text>• Generates comprehensive reputation score</Text>
                  <Text>
                    • {entityType === "public-figure"
                      ? "Public figures: Negative content weighted more heavily"
                      : entityType === "company"
                      ? "Companies: Enhanced brand reputation analysis"
                      : "Individuals: Balanced personal reputation scoring"
                    }
                  </Text>
                </>
              )}
            </VStack>
          </VStack>
        </HStack>
      </Box>
    </Box>
  );
}
