"use client";

import { ArrowRight } from "lucide-react";
import { FaGlobe, FaChartLine, FaComments } from "react-icons/fa";
import MathBackground from "../components/MathBackground";
import FeatureModal from "../components/FeatureModal";
import {
  Button,
  Box,
  Heading,
  Text,
  VStack,
  Grid,
  GridItem,
  Link as ChakraLink,
  Image,
  useDisclosure,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { useState } from "react";
import NextLink from "next/link";

const aquamarineColors = {
  4: "#00f8ba",
  300: "#00e5aa",
  500: "#00d299",
  700: "#00bf88",
};

const features = [
  {
    title: "Multi-Platform Monitoring",
    description:
      "Track keywords across Google, Claude, ChatGPT, YouTube, Reddit, X and more",
    modalContent:
      "Our Multi-Platform Monitoring feature allows you to keep track of your keywords across a wide range of platforms. From search engines like Google to social media giants like YouTube and X, and even AI platforms like Claude and ChatGPT, we've got you covered. This comprehensive approach ensures that you never miss a mention, allowing you to stay on top of your online presence across the entire digital landscape.",
    icon: FaGlobe,
  },
  {
    title: "Sentiment Analysis",
    description:
      "Understand the overall tone of discussions about your keywords",
    modalContent:
      "Our advanced Sentiment Analysis tool goes beyond just tracking mentions. It delves deep into the context and tone of the conversations surrounding your keywords. By analyzing the sentiment - whether positive, negative, or neutral - you'll gain valuable insights into public perception. This feature helps you gauge the emotional response to your brand or topics, allowing you to respond proactively and shape the narrative around your online presence.",
    icon: FaComments,
  },
  {
    title: "Trend Visualization",
    description: "See how sentiment changes over time with interactive charts",
    modalContent:
      "Our Trend Visualization feature brings your data to life. Through interactive and intuitive charts, you can visualize how sentiment and mentions of your keywords evolve over time. This powerful tool allows you to identify patterns, track the impact of your campaigns, and predict future trends. By transforming complex data into clear, visual insights, we empower you to make data-driven decisions and stay ahead of the curve in managing your online reputation.",
    icon: FaChartLine,
  },
];

export default function Home() {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature);
    onOpen();
  };

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      {/* Hero Section */}
      <Box
        as="section"
        position="relative"
        py={20}
        px={4}
        // bgGradient="linear(to-r, #052c25, #109b82)"
        bgGradient="linear(to-r, #052c25 10%, #109b82 50%, #052c25 90%)"
        overflow="hidden"
      >
        <Box position="absolute" inset={0} zIndex={0}>
          <MathBackground />
        </Box>
        <VStack
          maxW="6xl"
          mx="auto"
          spacing={8}
          position="relative"
          zIndex={10}
        >
          <Flex direction="column" align="center" textAlign="center">
            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "5xl" }}
              fontWeight="bold"
              mb={2}
            >
              Status Score
            </Heading>
            <Flex align="center" justify="center">
              <Text fontSize="lg" mr={2}>
                By
              </Text>
              <Image
                src="https://cdn.prod.website-files.com/6233ad14a49d0f3183132b4d/6233c49d2b153953c3ad5836_logo-2%20(2).png"
                alt="Status Labs Logo"
                h="20px"
                objectFit="contain"
              />
            </Flex>
          </Flex>
          <Text fontSize="xl" maxW="2xl" textAlign="center">
            Monitor your online presence with AI-powered sentiment analysis
            across multiple platforms.
          </Text>
          <Box position="relative" zIndex={20}>
            <Button
              as={ChakraLink}
              href="/onboarding"
              size="lg"
              rightIcon={<ArrowRight />}
              bg={aquamarineColors[4]}
              color="gray.900"
              _hover={{ bg: aquamarineColors[300] }}
            >
              Get Started
            </Button>
          </Box>
        </VStack>
      </Box>

      {/* Features Section */}
      <Box as="section" py={20} px={4}>
        <VStack maxW="6xl" mx="auto" spacing={16}>
          <Heading as="h2" fontSize="4xl" fontWeight="bold" textAlign="center">
            Key Features
          </Heading>
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
            gap={8}
          >
            {features.map((feature, index) => (
              <GridItem
                key={index}
                bg="gray.800"
                p={6}
                rounded="lg"
                shadow="md"
                borderTop="4px solid"
                borderColor={aquamarineColors[4]}
                transition="all 0.3s"
                _hover={{
                  bg: "gray.700",
                  shadow: "xl",
                  transform: "scale(1.05)",
                  borderColor: aquamarineColors[300],
                }}
                onClick={() => handleFeatureClick(feature)}
                cursor="pointer"
              >
                <VStack spacing={4} align="stretch">
                  <Icon
                    as={feature.icon}
                    w={10}
                    h={10}
                    color={aquamarineColors[4]}
                  />
                  <Heading as="h3" fontSize="2xl" fontWeight="bold">
                    {feature.title}
                  </Heading>
                  <Text>{feature.description}</Text>
                </VStack>
              </GridItem>
            ))}
          </Grid>
        </VStack>
      </Box>

      {/* Call to Action Section */}
      <Box as="section" py={20} px={4} bg="gray.800">
        <VStack maxW="6xl" mx="auto" spacing={8} textAlign="center">
          <Heading as="h2" fontSize="4xl" fontWeight="bold">
            Ready to boost your online presence?
          </Heading>
          <Text fontSize="xl" maxW="2xl">
            Start monitoring your keywords and get valuable insights today.
          </Text>
          <Button
            as={ChakraLink}
            href="/add-keyword"
            size="lg"
            bg={aquamarineColors[4]}
            color="gray.900"
            _hover={{ bg: aquamarineColors[300] }}
          >
            Add Your First Keyword
          </Button>
        </VStack>
      </Box>

      {/* Status Labs Logo */}
      <Box as="footer" py={8} bg="gray.900" textAlign="center">
        <Text fontSize="sm" mb={2}>
          Status Score is created by
        </Text>
        <Image
          src="https://cdn.prod.website-files.com/6233ad14a49d0f3183132b4d/6233c49d2b153953c3ad5836_logo-2%20(2).png"
          alt="Status Labs Logo"
          mx="auto"
          h="30px"
          objectFit="contain"
        />
      </Box>

      {/* Feature Modal */}
      <FeatureModal
        isOpen={isOpen}
        onClose={onClose}
        feature={selectedFeature}
      />
    </Box>
  );
}
