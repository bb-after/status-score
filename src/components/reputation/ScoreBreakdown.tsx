import {
  Box,
  VStack,
  HStack,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SimpleGrid,
} from "@chakra-ui/react";
import { ReputationData } from "./ReputationDashboard";

interface ScoreBreakdownProps {
  scoreData: ReputationData;
  setScoreData: (data: ReputationData) => void;
  type: "individual" | "company" | "public-figure";
}

export function ScoreBreakdown({
  scoreData,
  setScoreData,
  type,
}: ScoreBreakdownProps) {
  const updateScore = (field: keyof ReputationData, value: number) => {
    setScoreData({
      ...scoreData,
      [field]: value,
    });
  };

  const metrics = [
    {
      key: "positiveArticles" as const,
      label: "Positive Articles",
      description: `Number of positive articles/mentions found (max ${
        type === "individual"
          ? process.env.NEXT_PUBLIC_REPUTATION_RESULTS_INDIVIDUAL || 10
          : type === "company"
            ? process.env.NEXT_PUBLIC_REPUTATION_RESULTS_COMPANY || 15
            : process.env.NEXT_PUBLIC_REPUTATION_RESULTS_PUBLIC_FIGURE || 20
      })`,
      max:
        type === "individual"
          ? parseInt(
              process.env.NEXT_PUBLIC_REPUTATION_RESULTS_INDIVIDUAL || "10",
            )
          : type === "company"
            ? parseInt(
                process.env.NEXT_PUBLIC_REPUTATION_RESULTS_COMPANY || "15",
              )
            : parseInt(
                process.env.NEXT_PUBLIC_REPUTATION_RESULTS_PUBLIC_FIGURE ||
                  "20",
              ),
      color: "green",
    },
    {
      key: "wikipediaPresence" as const,
      label: "Wikipedia Presence",
      description: "Authority and credibility indicators",
      max: 5,
      color: "blue",
      hidden: type === "individual", // Individuals rarely have Wikipedia pages
    },
    {
      key: "ownedAssets" as const,
      label: "Owned Digital Assets",
      description: "Count of owned properties on page 1 (0-10, 5+ = perfect)",
      max: 10,
      color: "purple",
    },
    {
      key: "negativeLinks" as const,
      label: "Negative Links",
      description: `Number of negative articles/mentions (max ${
        type === "individual"
          ? process.env.NEXT_PUBLIC_REPUTATION_RESULTS_INDIVIDUAL || 10
          : type === "company"
            ? process.env.NEXT_PUBLIC_REPUTATION_RESULTS_COMPANY || 15
            : process.env.NEXT_PUBLIC_REPUTATION_RESULTS_PUBLIC_FIGURE || 20
      })`,
      max:
        type === "individual"
          ? parseInt(
              process.env.NEXT_PUBLIC_REPUTATION_RESULTS_INDIVIDUAL || "10",
            )
          : type === "company"
            ? parseInt(
                process.env.NEXT_PUBLIC_REPUTATION_RESULTS_COMPANY || "15",
              )
            : parseInt(
                process.env.NEXT_PUBLIC_REPUTATION_RESULTS_PUBLIC_FIGURE ||
                  "20",
              ),
      color: "red",
      isNegative: true,
    },
    {
      key: "socialPresence" as const,
      label: "Social Media Presence",
      description: "Social media visibility and engagement (%)",
      max: 100,
      color: "cyan",
    },
    {
      key: "geoPresence" as const,
      label: "GEO Presence",
      description: "Generative Engine Optimization score (%)",
      max: 100,
      color: "orange",
    },
  ].filter((metric) => !metric.hidden);

  return (
    <Box
      bg="white"
      rounded="xl"
      shadow="sm"
      border="1px"
      borderColor="gray.200"
      p={6}
    >
      <VStack spacing={6} align="stretch">
        <Text fontSize="lg" fontWeight="semibold" color="gray.900">
          Score Breakdown
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {metrics.map((metric) => (
            <VStack key={metric.key} spacing={3} align="stretch">
              <VStack align="stretch" spacing={1}>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    {metric.label}
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={`${metric.color}.500`}
                  >
                    {scoreData[metric.key]}
                    {metric.key === "socialPresence" ? "%" : ""}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {metric.description}
                </Text>
              </VStack>

              <Slider
                value={scoreData[metric.key]}
                onChange={(value) => updateScore(metric.key, value)}
                max={metric.max}
                min={0}
                step={1}
                colorScheme={metric.color}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>

              {metric.isNegative && scoreData[metric.key] > 0 && (
                <Text fontSize="xs" color="red.500">
                  ⚠️ High negative content impacts score significantly
                </Text>
              )}
            </VStack>
          ))}
        </SimpleGrid>

        <Box bg="gray.50" rounded="lg" p={4}>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            <strong>Tip:</strong> Adjust the sliders above to simulate how
            changes to these factors would affect your reputation score.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
