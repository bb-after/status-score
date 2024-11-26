import { ArrowRight } from "lucide-react";
import MathBackground from "../components/MathBackground";
import {
  Button,
  Box,
  Heading,
  Text,
  VStack,
  Grid,
  GridItem,
  Link as ChakraLink,
} from "@chakra-ui/react";

export default function Home() {
  return (
    <Box minH="100vh" bg="gray.900" color="white">
      {/* Hero Section */}
      <Box
        as="section"
        position="relative"
        py={20}
        px={4}
        bgGradient="linear(to-r, blue.900, purple.900)"
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
          <Heading as="h1" fontSize="5xl" fontWeight="bold">
            Status Score
          </Heading>
          <Text fontSize="xl" maxW="2xl" textAlign="center">
            Monitor your online presence with AI-powered sentiment analysis
            across multiple platforms.
          </Text>
          <Box position="relative" zIndex={20}>
            <Button
              as={ChakraLink}
              href="/dashboard"
              size="lg"
              variant="solid" // Use the solid variant defined in your theme
              rightIcon={<ArrowRight />}
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
            {[
              {
                title: "Multi-Platform Monitoring",
                description:
                  "Track keywords across Google, YouTube, Reddit, and X",
              },
              {
                title: "Sentiment Analysis",
                description:
                  "Understand the overall tone of discussions about your keywords",
              },
              {
                title: "Trend Visualization",
                description:
                  "See how sentiment changes over time with interactive charts",
              },
            ].map((feature, index) => (
              <GridItem
                key={index}
                bg="gray.800"
                p={6}
                rounded="lg"
                shadow="md"
                borderTop="4px solid"
                borderColor="aquamarine.4"
                transition="all 0.3s"
                _hover={{
                  bg: "gray.700",
                  shadow: "xl",
                  transform: "scale(1.05)",
                  borderColor: "aquamarine.4",
                }}
              >
                <Heading as="h3" fontSize="2xl" fontWeight="bold" mb={4}>
                  {feature.title}
                </Heading>
                <Text>{feature.description}</Text>
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
          <Button as={ChakraLink} href="/add-keyword" size="lg" variant="solid">
            Add Your First Keyword
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
