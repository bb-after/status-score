import {
  Box,
  VStack,
  Text,
  CircularProgress,
  CircularProgressLabel,
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

interface ScoreOverviewProps {
  score: number;
  type: "individual" | "company" | "public-figure";
  keyword?: string;
  hasSearched: boolean;
  historicalData: Array<{ date: string; score: number }>;
}

export function ScoreOverview({
  score,
  type,
  keyword,
  hasSearched,
  historicalData,
}: ScoreOverviewProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score counter from 0 to target score
  useEffect(() => {
    if (hasSearched && score > 0) {
      setAnimatedScore(0);
      const duration = 2000; // 2 seconds animation
      const steps = 60; // 60fps-like animation
      const increment = score / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const nextValue = Math.min(Math.round(increment * currentStep), score);
        setAnimatedScore(nextValue);

        if (currentStep >= steps || nextValue >= score) {
          setAnimatedScore(score);
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    } else if (!hasSearched) {
      setAnimatedScore(0);
    }
  }, [score, hasSearched]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    if (score >= 40) return "orange";
    return "red";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const displayScore = hasSearched ? animatedScore : 0;

  return (
    <Box
      bg="white"
      rounded="xl"
      shadow="sm"
      border="1px"
      borderColor="gray.200"
      p={6}
      textAlign="center"
    >
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="semibold" color="gray.900">
          Reputation Score
        </Text>

        {keyword && (
          <Text fontSize="md" color="gray.600">
            {keyword}
          </Text>
        )}

        <CircularProgress
          value={displayScore}
          size="150px"
          thickness="8px"
          color={`${getScoreColor(displayScore)}.400`}
          trackColor="gray.100"
        >
          <CircularProgressLabel fontSize="2xl" fontWeight="bold">
            {displayScore}
          </CircularProgressLabel>
        </CircularProgress>

        <VStack spacing={2}>
          <Badge
            colorScheme={getScoreColor(score)}
            size="lg"
            px={3}
            py={1}
            rounded="full"
          >
            {getScoreLabel(score)}
          </Badge>

          <Text fontSize="sm" color="gray.500" textAlign="center">
            {type === "individual" && "Individual reputation analysis"}
            {type === "company" && "Company reputation analysis"}
            {type === "public-figure" && "Public figure reputation analysis"}
          </Text>
        </VStack>

        {hasSearched && historicalData.length > 1 && (
          <Box>
            <Text fontSize="sm" color="gray.600">
              Historical Trend: {historicalData.length} data points
            </Text>
            {historicalData.length >= 2 && (
              <Text fontSize="xs" color="gray.500">
                First: {historicalData[0].score} → Latest:{" "}
                {historicalData[historicalData.length - 1].score}
              </Text>
            )}
          </Box>
        )}

        {!hasSearched && (
          <Text fontSize="sm" color="gray.500">
            Search for a name or company to see their reputation score
          </Text>
        )}
      </VStack>
    </Box>
  );
}
