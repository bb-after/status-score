import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Link,
  Collapse,
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaEdit,
  FaCog,
  FaThumbsUp,
  FaThumbsDown,
  FaEquals,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaPinterest,
  FaMedium,
  FaGlobe,
} from "react-icons/fa";
import { SearchResult } from "./ReputationDashboard";
import { SentimentModal } from "./SentimentModal";
import { AssetClaimModal } from "./AssetClaimModal";
import {
  calculateScoreFromLegacyData,
  type EntityType,
} from "../../utils/scoreCalculator";

interface ExtendedSearchResult extends SearchResult {
  userAnnotation?: {
    sentiment?: {
      value: "positive" | "neutral" | "negative";
      reason: string;
      updatedAt: string;
    };
    assetClaim?: {
      claimType: "owned" | "not_owned" | "not_relevant";
      reason: string;
      updatedAt: string;
    };
  };
}

interface SearchResultsProps {
  keyword: string;
  results: ExtendedSearchResult[];
  isVisible: boolean;
  entityType?: "individual" | "company" | "public-figure";
  originalScoreData?: {
    positiveArticles: number;
    wikipediaPresence: number;
    ownedAssets: number;
    negativeLinks: number;
    socialPresence: number;
    geoPresence: number;
    totalResults?: number;
  };
  onScoreUpdate?: (newScoreData: {
    positiveArticles: number;
    negativeLinks: number;
    score: number;
  }) => void;
}

export function SearchResults({
  keyword,
  results,
  isVisible,
  entityType = "individual",
  originalScoreData,
  onScoreUpdate,
}: SearchResultsProps) {
  const [selectedResult, setSelectedResult] =
    useState<ExtendedSearchResult | null>(null);
  const [extendedResults, setExtendedResults] =
    useState<ExtendedSearchResult[]>(results);
  const {
    isOpen: isSentimentModalOpen,
    onOpen: onSentimentModalOpen,
    onClose: onSentimentModalClose,
  } = useDisclosure();
  const {
    isOpen: isAssetModalOpen,
    onOpen: onAssetModalOpen,
    onClose: onAssetModalClose,
  } = useDisclosure();

  // Fetch existing annotations when results change
  useEffect(() => {
    const fetchAnnotations = async () => {
      if (!results.length || !keyword) return;

      try {
        const urls = results.map((r) => r.url);
        const params = new URLSearchParams();
        params.append("keyword", keyword);
        urls.forEach((url) => params.append("urls", url));
        const response = await fetch(
          `/api/reputation/annotations/get?${params}`,
        );

        if (response.ok) {
          const data = await response.json();

          // Merge annotations with results
          const resultsWithAnnotations = results.map((result) => ({
            ...result,
            userAnnotation: data.annotations[result.url],
          }));

          setExtendedResults(resultsWithAnnotations);
        }
      } catch (error) {
        console.error("Failed to fetch annotations:", error);
        // If fetch fails, just use results as-is
        setExtendedResults(results.map((r) => ({ ...r })));
      }
    };

    fetchAnnotations();
  }, [results, keyword]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "green";
      case "negative":
        return "red";
      default:
        return "gray";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return FaThumbsUp;
      case "negative":
        return FaThumbsDown;
      default:
        return FaEquals;
    }
  };

  const getSocialIcon = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("facebook.com")) return FaFacebook;
    if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com"))
      return FaTwitter;
    if (lowerUrl.includes("linkedin.com")) return FaLinkedin;
    if (lowerUrl.includes("instagram.com")) return FaInstagram;
    if (lowerUrl.includes("pinterest.com")) return FaPinterest;
    if (lowerUrl.includes("medium.com")) return FaMedium;
    return FaGlobe;
  };

  const isSocialMedia = (url: string) => {
    const lowerUrl = url.toLowerCase();
    return [
      "facebook.com",
      "twitter.com",
      "x.com",
      "linkedin.com",
      "instagram.com",
      "pinterest.com",
      "medium.com",
    ].some((domain) => lowerUrl.includes(domain));
  };

  // Calculate updated score based on current sentiment distribution using the exact same logic as ReputationDashboard
  const calculateUpdatedScore = (results: ExtendedSearchResult[]) => {
    const positiveCount = results.filter((r) => {
      const currentSentiment =
        r.userAnnotation?.sentiment?.value || r.sentiment;
      return currentSentiment === "positive";
    }).length;

    const negativeCount = results.filter((r) => {
      const currentSentiment =
        r.userAnnotation?.sentiment?.value || r.sentiment;
      return currentSentiment === "negative";
    }).length;

    // Use originalScoreData if available, otherwise use defaults
    const scoreData = originalScoreData || {
      positiveArticles: positiveCount,
      wikipediaPresence: 2,
      ownedAssets: 4,
      negativeLinks: negativeCount,
      socialPresence: 85,
      geoPresence: 70,
    };

    // Update the counts to reflect user adjustments
    const updatedScoreData = {
      ...scoreData,
      positiveArticles: positiveCount,
      negativeLinks: negativeCount,
      // Preserve totalResults for accurate percentage-based scoring
      totalResults: scoreData.totalResults || results.length,
    };

    // Use centralized scoring logic
    const score = calculateScoreFromLegacyData(
      updatedScoreData,
      entityType as EntityType,
    );

    return {
      positiveArticles: positiveCount,
      negativeLinks: negativeCount,
      score,
    };
  };

  const handleSentimentAdjustment = (result: ExtendedSearchResult) => {
    setSelectedResult(result);
    onSentimentModalOpen();
  };

  const handleAssetClaim = (result: ExtendedSearchResult) => {
    setSelectedResult(result);
    onAssetModalOpen();
  };

  const handleSentimentSave = async (
    newSentiment: "positive" | "neutral" | "negative",
    reason: string,
  ) => {
    if (!selectedResult) return;

    // TODO: Call API to save sentiment annotation
    try {
      const response = await fetch("/api/reputation/annotations/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: selectedResult.url,
          sentiment: newSentiment,
          reason,
          keyword,
        }),
      });

      if (!response.ok) throw new Error("Failed to save sentiment");

      // Update local state to reflect the change
      const resultIndex = extendedResults.findIndex(
        (r) => r.url === selectedResult.url,
      );
      if (resultIndex !== -1) {
        const updatedResults = [...extendedResults];
        updatedResults[resultIndex] = {
          ...updatedResults[resultIndex],
          sentiment: newSentiment,
          userAnnotation: {
            ...updatedResults[resultIndex].userAnnotation,
            sentiment: {
              value: newSentiment,
              reason,
              updatedAt: new Date().toISOString(),
            },
          },
        };
        setExtendedResults(updatedResults);

        // Calculate and notify parent of score update
        if (onScoreUpdate) {
          const newScoreData = calculateUpdatedScore(updatedResults);
          onScoreUpdate(newScoreData);

          // Update the backend reputation search record with new score
          fetch("/api/reputation/update-score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              keyword,
              positiveArticles: newScoreData.positiveArticles,
              negativeLinks: newScoreData.negativeLinks,
              score: newScoreData.score,
            }),
          }).catch((error) =>
            console.error("Failed to update backend score:", error),
          );
        }
      }
    } catch (error) {
      console.error("Failed to save sentiment:", error);
      throw error;
    }
  };

  const handleAssetClaimSave = async (
    claimType: "owned" | "not_owned" | "not_relevant",
    reason: string,
  ) => {
    if (!selectedResult) return;

    // TODO: Call API to save asset claim
    try {
      const response = await fetch("/api/reputation/annotations/asset-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: selectedResult.url,
          claimType,
          reason,
          keyword,
        }),
      });

      if (!response.ok) throw new Error("Failed to save asset claim");

      // Update local state to reflect the change
      const resultIndex = extendedResults.findIndex(
        (r) => r.url === selectedResult.url,
      );
      if (resultIndex !== -1) {
        const updatedResults = [...extendedResults];
        updatedResults[resultIndex] = {
          ...updatedResults[resultIndex],
          userAnnotation: {
            ...updatedResults[resultIndex].userAnnotation,
            assetClaim: {
              claimType,
              reason,
              updatedAt: new Date().toISOString(),
            },
          },
        };
        setExtendedResults(updatedResults);
      }
    } catch (error) {
      console.error("Failed to save asset claim:", error);
      throw error;
    }
  };

  return (
    <>
      <Collapse in={isVisible} animateOpacity>
        <Box
          bg="white"
          rounded="xl"
          shadow="sm"
          border="1px"
          borderColor="gray.200"
          p={6}
          mb={8}
          mx={6}
        >
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              Search Results for &ldquo;{keyword}&rdquo;
            </Text>

            <Text fontSize="sm" color="gray.600">
              Found {extendedResults.length} results
            </Text>

            <VStack spacing={3} align="stretch">
              {extendedResults.map((result, index) => {
                const currentSentiment =
                  result.userAnnotation?.sentiment?.value || result.sentiment;
                const SocialIcon = getSocialIcon(result.url);
                const isaSocialSite = isSocialMedia(result.url);

                return (
                  <Box
                    key={index}
                    p={4}
                    border="1px"
                    borderColor="gray.100"
                    rounded="lg"
                    _hover={{ borderColor: "gray.300" }}
                  >
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between" align="start">
                        <VStack align="stretch" spacing={1} flex={1}>
                          <HStack spacing={2}>
                            <Icon
                              as={SocialIcon}
                              boxSize={3}
                              color="gray.500"
                            />
                            <Link
                              href={result.url}
                              isExternal
                              fontSize="sm"
                              fontWeight="semibold"
                              color="blue.600"
                              _hover={{ textDecoration: "underline" }}
                            >
                              {result.title}
                            </Link>
                            {isaSocialSite && (
                              <Tooltip label="Social Media Profile">
                                <Badge
                                  colorScheme="blue"
                                  size="xs"
                                  variant="outline"
                                >
                                  Social
                                </Badge>
                              </Tooltip>
                            )}
                          </HStack>
                          <HStack spacing={3}>
                            <Text fontSize="xs" color="gray.500">
                              {result.source} • Rank #{result.rank}
                            </Text>
                            {result.userAnnotation?.sentiment && (
                              <Badge
                                colorScheme="purple"
                                size="xs"
                                variant="outline"
                              >
                                User Adjusted
                              </Badge>
                            )}
                            {result.userAnnotation?.assetClaim && (
                              <Badge
                                colorScheme={
                                  result.userAnnotation.assetClaim.claimType ===
                                  "owned"
                                    ? "green"
                                    : "gray"
                                }
                                size="xs"
                                variant="outline"
                              >
                                {result.userAnnotation.assetClaim.claimType ===
                                "owned"
                                  ? "My Asset"
                                  : "Not Mine"}
                              </Badge>
                            )}
                          </HStack>
                        </VStack>

                        <HStack spacing={2}>
                          <Tooltip
                            label={
                              result.userAnnotation?.sentiment
                                ? `Adjusted: ${result.userAnnotation.sentiment.reason}`
                                : "Click to adjust sentiment"
                            }
                          >
                            <Badge
                              colorScheme={getSentimentColor(currentSentiment)}
                              size="sm"
                              cursor="pointer"
                              _hover={{ opacity: 0.8 }}
                              onClick={() => handleSentimentAdjustment(result)}
                            >
                              <HStack spacing={1}>
                                <Icon
                                  as={getSentimentIcon(currentSentiment)}
                                  boxSize={2}
                                />
                                <Text>{currentSentiment}</Text>
                              </HStack>
                            </Badge>
                          </Tooltip>

                          <Menu>
                            <MenuButton
                              as={Button}
                              size="xs"
                              variant="outline"
                              colorScheme="gray"
                            >
                              <Icon as={FaCog} />
                            </MenuButton>
                            <MenuList>
                              <MenuItem
                                icon={<Icon as={FaEdit} />}
                                onClick={() =>
                                  handleSentimentAdjustment(result)
                                }
                              >
                                Adjust Sentiment
                              </MenuItem>
                              {isaSocialSite && (
                                <MenuItem
                                  icon={<Icon as={SocialIcon} />}
                                  onClick={() => handleAssetClaim(result)}
                                >
                                  Claim Asset
                                </MenuItem>
                              )}
                            </MenuList>
                          </Menu>
                        </HStack>
                      </HStack>

                      <Text fontSize="sm" color="gray.600">
                        {result.snippet}
                      </Text>
                    </VStack>
                  </Box>
                );
              })}
            </VStack>
          </VStack>
        </Box>
      </Collapse>

      {/* Modals */}
      <SentimentModal
        isOpen={isSentimentModalOpen}
        onClose={onSentimentModalClose}
        result={selectedResult}
        currentSentiment={
          selectedResult?.userAnnotation?.sentiment?.value ||
          selectedResult?.sentiment ||
          "neutral"
        }
        onSave={handleSentimentSave}
        existingAnnotation={
          selectedResult?.userAnnotation?.sentiment
            ? {
                sentiment: selectedResult.userAnnotation.sentiment.value,
                reason: selectedResult.userAnnotation.sentiment.reason,
                updatedAt: selectedResult.userAnnotation.sentiment.updatedAt,
              }
            : undefined
        }
      />

      <AssetClaimModal
        isOpen={isAssetModalOpen}
        onClose={onAssetModalClose}
        result={selectedResult}
        onSave={handleAssetClaimSave}
        existingClaim={selectedResult?.userAnnotation?.assetClaim}
      />
    </>
  );
}
