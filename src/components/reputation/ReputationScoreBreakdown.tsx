import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Card,
  CardBody,
  SimpleGrid,
  Flex,
  Button,
  ButtonGroup,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiPieChart, FiBarChart } from "react-icons/fi";
import { motion } from "framer-motion";
import { ReputationData } from "./ReputationDashboard";

interface ScoreBreakdownProps {
  scoreData: ReputationData;
  type: "individual" | "company" | "public-figure";
}

interface FactorData {
  label: string;
  value: number;
  weight: number;
  color: string;
  rawValue: number;
  description: string;
}

export function ReputationScoreBreakdown({
  scoreData,
  type,
}: ScoreBreakdownProps) {
  const [activeChart, setActiveChart] = useState<"pie" | "bar">("pie");
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>(
    {},
  );

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.900", "white");
  const mutedTextColor = useColorModeValue("gray.600", "gray.400");

  const getFactorLabel = (key: string) => {
    const labels: Record<string, string> = {
      positiveArticles: "Positive Articles",
      wikipediaPresence:
        type === "individual" ? "Authority Pages" : "Wikipedia Presence",
      ownedAssets: "Owned Assets",
      negativeLinks: "Negative Links",
      socialPresence: "Social Presence",
    };
    return labels[key] || key;
  };

  const getFactorDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      positiveArticles: "News articles, press releases, and positive coverage",
      wikipediaPresence:
        type === "individual"
          ? "Professional profiles and authority pages"
          : "Wikipedia articles and authority pages",
      ownedAssets:
        "Websites, social profiles, and digital properties you control",
      negativeLinks: "Negative articles, complaints, and critical coverage",
      socialPresence: "Social media activity, followers, and engagement",
    };
    return descriptions[key] || "";
  };

  const getFactorWeight = (key: string) => {
    if (type === "public-figure") {
      const weights: Record<string, number> = {
        positiveArticles: 70,
        wikipediaPresence: 10,
        ownedAssets: 10,
        negativeLinks: 10, // This is deduction, not additive weight
        socialPresence: 5,
      };
      return weights[key] || 0;
    } else if (type === "company") {
      const weights: Record<string, number> = {
        positiveArticles: 70,
        wikipediaPresence: 10,
        ownedAssets: 10,
        negativeLinks: 10, // This is deduction, not additive weight
        socialPresence: 5,
      };
      return weights[key] || 0;
    } else {
      // individual
      const weights: Record<string, number> = {
        positiveArticles: 70,
        wikipediaPresence: 0,
        ownedAssets: 15,
        negativeLinks: 10, // This is deduction, not additive weight
        socialPresence: 10,
      };
      return weights[key] || 0;
    }
  };

  const getFactorColor = (key: string) => {
    const colors: Record<string, string> = {
      positiveArticles: "#10B981", // Green
      wikipediaPresence: "#3B82F6", // Blue
      ownedAssets: "#8B5CF6", // Purple
      negativeLinks: "#EF4444", // Red
      socialPresence: "#F59E0B", // Amber
    };
    return colors[key] || "#6B7280";
  };

  const getFactorScore = (key: string, value: number) => {
    if (key === "negativeLinks") {
      // Negative links reduce score
      return Math.max(0, 100 - value * 25);
    }

    const maxValues: Record<string, number> = {
      positiveArticles: 15,
      wikipediaPresence: 5,
      ownedAssets: 100,
      socialPresence: 100,
    };

    const maxValue = maxValues[key] || 100;
    return Math.min(100, (value / maxValue) * 100);
  };

  const getScoreColorScheme = (score: number) => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    return "red";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "green.600";
    if (score >= 60) return "yellow.600";
    return "red.600";
  };

  // Animate bars when switching to bar chart view
  useEffect(() => {
    if (activeChart === "bar") {
      const newAnimatedValues: Record<string, number> = {};

      // Calculate scores for animation
      Object.entries(scoreData).forEach(([key, value]) => {
        // Filter out deprecated and non-displayed fields
        if (
          key === "geoPresence" ||
          key === "aiOverviews" ||
          key === "totalResults"
        )
          return;
        // Filter out Wikipedia presence for individuals
        if (type === "individual" && key === "wikipediaPresence") return;

        const score = getFactorScore(key, value);
        newAnimatedValues[key] = score;
      });

      // Reset to 0 first
      setAnimatedValues(
        Object.keys(newAnimatedValues).reduce(
          (acc, key) => ({ ...acc, [key]: 0 }),
          {},
        ),
      );

      // Then animate to actual values
      setTimeout(() => {
        setAnimatedValues(newAnimatedValues);
      }, 100);
    }
  }, [activeChart, scoreData, type]);

  // Calculate pie chart data (exclude geoPresence and aiOverviews, and totalResults)
  const pieData: FactorData[] = Object.entries(scoreData)
    .filter(([key]) => {
      // Filter out deprecated and non-displayed fields
      if (
        key === "geoPresence" ||
        key === "aiOverviews" ||
        key === "totalResults"
      )
        return false;
      // Filter out Wikipedia presence for individuals
      if (type === "individual" && key === "wikipediaPresence") return false;
      return true;
    })
    .map(([key, value]) => ({
      label: getFactorLabel(key),
      value: getFactorScore(key, value),
      weight: getFactorWeight(key),
      color: getFactorColor(key),
      rawValue: value,
      description: getFactorDescription(key),
    }));

  // Calculate pie chart segments
  const total = pieData.reduce((sum, item) => sum + item.weight, 0);
  let currentAngle = 0;
  const pieSegments = pieData.map((item) => {
    const percentage = (item.weight / total) * 100;
    const angle = (item.weight / total) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return segment;
  });

  // SVG utilities
  const createPieSlice = (
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
  ) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      centerX,
      centerY,
      "L",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number,
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <Card bg={cardBg} shadow="sm" borderWidth="1px">
      <CardBody>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Score Breakdown
            </Text>
            <Text fontSize="sm" color={mutedTextColor}>
              Detailed analysis of reputation factors
            </Text>
          </Box>

          {/* Chart Type Toggle */}
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              onClick={() => setActiveChart("pie")}
              variant={activeChart === "pie" ? "solid" : "outline"}
              colorScheme={activeChart === "pie" ? "blue" : "gray"}
              leftIcon={<Icon as={FiPieChart} />}
            >
              Pie Chart
            </Button>
            <Button
              onClick={() => setActiveChart("bar")}
              variant={activeChart === "bar" ? "solid" : "outline"}
              colorScheme={activeChart === "bar" ? "blue" : "gray"}
              leftIcon={<Icon as={FiBarChart} />}
            >
              Bar Chart
            </Button>
          </ButtonGroup>
        </Flex>

        {activeChart === "pie" ? (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Pie Chart */}
            <VStack>
              <Box position="relative">
                <svg
                  width="240"
                  height="240"
                  viewBox="0 0 240 240"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  {pieSegments.map((segment, index) => (
                    <path
                      key={index}
                      d={createPieSlice(
                        120,
                        120,
                        100,
                        segment.startAngle,
                        segment.endAngle,
                      )}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        cursor: "pointer",
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    />
                  ))}
                </svg>

                {/* Center Label */}
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <VStack spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                      {Object.values(scoreData).reduce(
                        (sum, val) => sum + (typeof val === "number" ? val : 0),
                        0,
                      )}
                    </Text>
                    <Text fontSize="sm" color={mutedTextColor}>
                      Total Points
                    </Text>
                  </VStack>
                </Box>
              </Box>

              {/* Legend */}
              <VStack spacing={2} w="full" maxW="xs" mt={6}>
                {pieSegments.map((segment, index) => (
                  <Flex
                    key={index}
                    justify="space-between"
                    w="full"
                    fontSize="sm"
                  >
                    <HStack spacing={2}>
                      <Box w={3} h={3} borderRadius="full" bg={segment.color} />
                      <Text color={mutedTextColor}>{segment.label}</Text>
                    </HStack>
                    <Text fontWeight="medium" color={textColor}>
                      {segment.percentage.toFixed(1)}%
                    </Text>
                  </Flex>
                ))}
              </VStack>
            </VStack>

            {/* Factor Details */}
            <VStack spacing={4} align="stretch">
              {pieData.map((item) => {
                const factorKey = Object.keys(scoreData).find(
                  (key) => getFactorLabel(key) === item.label,
                )!;
                const score = item.value;
                const weight = item.weight;

                return (
                  <Box key={factorKey} bg="gray.50" borderRadius="lg" p={4}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="medium" color={textColor}>
                        {item.label}
                      </Text>
                      <HStack spacing={2}>
                        <Text fontSize="sm" color={mutedTextColor}>
                          {weight}% weight
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color={getScoreColor(score)}
                        >
                          {score.toFixed(0)}/100
                        </Text>
                      </HStack>
                    </Flex>

                    <Text fontSize="sm" color={mutedTextColor} mb={3}>
                      {item.description}
                    </Text>

                    {/* Progress Bar */}
                    <Progress
                      value={score}
                      colorScheme={getScoreColorScheme(score)}
                      size="sm"
                      borderRadius="full"
                      mb={2}
                    />

                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" color={mutedTextColor}>
                        Current:{" "}
                        {factorKey === "negativeLinks"
                          ? `${item.rawValue} links`
                          : factorKey === "positiveArticles" ||
                              factorKey === "aiOverviews"
                            ? `${item.rawValue} articles`
                            : factorKey === "wikipediaPresence"
                              ? `${item.rawValue}/5 rating`
                              : `${item.rawValue}%`}
                      </Text>
                      <Text fontSize="xs" color={mutedTextColor}>
                        Impact: {((score * weight) / 100).toFixed(1)} points
                      </Text>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          </SimpleGrid>
        ) : (
          /* Bar Chart View */
          <VStack spacing={6} align="stretch">
            {pieData.map((item) => {
              const factorKey = Object.keys(scoreData).find(
                (key) => getFactorLabel(key) === item.label,
              )!;
              const score = item.value;
              const weight = item.weight;

              return (
                <VStack key={factorKey} spacing={3} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Text fontWeight="medium" color={textColor}>
                        {item.label}
                      </Text>
                      <Text fontSize="sm" color={mutedTextColor}>
                        {item.description}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color={getScoreColor(score)}
                      >
                        {score.toFixed(0)}
                      </Text>
                      <Text fontSize="sm" color={mutedTextColor}>
                        {weight}% weight
                      </Text>
                    </Box>
                  </Flex>

                  {/* Horizontal Bar */}
                  <Box position="relative">
                    <Progress
                      value={
                        animatedValues[factorKey] !== undefined
                          ? animatedValues[factorKey]
                          : score
                      }
                      colorScheme={getScoreColorScheme(score)}
                      size="lg"
                      borderRadius="full"
                      sx={{
                        "& > div:first-of-type": {
                          transition: "width 1.2s ease-out",
                        },
                      }}
                    />

                    <Flex
                      justify="space-between"
                      fontSize="xs"
                      color={mutedTextColor}
                      mt={1}
                    >
                      <Text>0</Text>
                      <Text>50</Text>
                      <Text>100</Text>
                    </Flex>
                  </Box>

                  <Flex justify="space-between" fontSize="sm">
                    <Text color={mutedTextColor}>
                      Current:{" "}
                      {factorKey === "negativeLinks"
                        ? `${item.rawValue} links`
                        : factorKey === "positiveArticles" ||
                            factorKey === "aiOverviews"
                          ? `${item.rawValue} articles`
                          : factorKey === "wikipediaPresence"
                            ? `${item.rawValue}/5 rating`
                            : `${item.rawValue}%`}
                    </Text>
                    <Text color={mutedTextColor}>
                      Score Impact: {((score * weight) / 100).toFixed(1)} points
                    </Text>
                  </Flex>
                </VStack>
              );
            })}
          </VStack>
        )}

        {/* Summary Stats */}
        <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4} mt={8}>
          <Card bg="green.50" borderColor="green.200" borderWidth="1px">
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {pieData.filter((item) => item.value >= 80).length}
              </Text>
              <Text fontSize="sm" color="green.700">
                Strong Factors
              </Text>
            </CardBody>
          </Card>

          <Card bg="yellow.50" borderColor="yellow.200" borderWidth="1px">
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                {
                  pieData.filter((item) => item.value >= 60 && item.value < 80)
                    .length
                }
              </Text>
              <Text fontSize="sm" color="yellow.700">
                Moderate Factors
              </Text>
            </CardBody>
          </Card>

          <Card bg="red.50" borderColor="red.200" borderWidth="1px">
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="red.600">
                {pieData.filter((item) => item.value < 60).length}
              </Text>
              <Text fontSize="sm" color="red.700">
                Weak Factors
              </Text>
            </CardBody>
          </Card>

          <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {pieData.reduce((sum, item) => sum + item.weight, 0)}%
              </Text>
              <Text fontSize="sm" color="blue.700">
                Total Weight
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
}
