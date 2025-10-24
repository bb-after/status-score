import {
  Box,
  VStack,
  Text,
  CircularProgress,
  CircularProgressLabel,
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

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
  // Use Framer Motion's useMotionValue for smooth animation
  const motionScore = useMotionValue(0);

  // Apply spring animation with nice easing
  const springScore = useSpring(motionScore, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Transform the spring value to a rounded number for display
  const displayScore = useTransform(springScore, (value) => Math.round(value));

  const [animatedScore, setAnimatedScore] = useState(0);

  // Always reset to 0 and animate to target score when score changes
  useEffect(() => {
    // Reset to 0 first
    motionScore.set(0);
    setAnimatedScore(0);

    // Small delay to ensure reset is visible, then animate to target
    const resetTimeout = setTimeout(() => {
      motionScore.set(score);
    }, 100);

    return () => clearTimeout(resetTimeout);
  }, [score, motionScore]);

  // Update the animated score state when spring value changes
  useEffect(() => {
    const unsubscribe = displayScore.on("change", (latest) => {
      setAnimatedScore(latest);
    });

    return unsubscribe;
  }, [displayScore]);

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

  const finalDisplayScore = animatedScore;

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

        <motion.div
          key={score} // Forces remount on score change for animation reset
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <CircularProgress
            value={finalDisplayScore}
            size="150px"
            thickness="8px"
            color={`${getScoreColor(finalDisplayScore)}.400`}
            trackColor="gray.100"
          >
            <CircularProgressLabel fontSize="2xl" fontWeight="bold">
              {finalDisplayScore}
            </CircularProgressLabel>
          </CircularProgress>
        </motion.div>

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
