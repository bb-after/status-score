import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Container,
  Flex,
  Icon,
  Progress,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import { FaPlus, FaUsers, FaClock, FaChartBar } from "react-icons/fa";
import { useRouter } from "next/router";
import NextLink from "next/link";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const steps = [
  {
    title: "Add Keywords",
    description:
      "Start by adding keywords you want to monitor. These keywords will be used to track mentions and analyze sentiment across various platforms.",
    icon: FaPlus,
    link: "/add-keyword",
    linkText: "Add Keywords",
  },
  {
    title: "Invite Team Members",
    description:
      "Collaborate with your team by inviting them to your Status Score account. Team members can help manage keywords and analyze reports.",
    icon: FaUsers,
    link: "/teams",
    linkText: "Invite Team Members",
  },
  {
    title: "Set Up Scheduling",
    description:
      "Configure how often you want to receive updates on your keywords. Regular scheduling ensures you stay up-to-date with the latest mentions and sentiment analysis.",
    icon: FaClock,
    link: "/schedule",
    linkText: "Set Up Scheduling",
  },
  {
    title: "View Reports",
    description:
      "Access comprehensive reports on your keywords. Analyze trends, sentiment, and mentions across different platforms to gain valuable insights.",
    icon: FaChartBar,
    link: "/dashboard",
    linkText: "View Reports",
  },
];

const OnboardingPage = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const aquamarineColors = {
    4: "#00f8ba",
    300: "#00e5aa",
    500: "#00d299",
    700: "#00bf88",
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/auth/me", {
          withCredentials: true,
        });
        if (response.data) {
          setIsAuthenticated(true);
        } else {
          router.push("/api/auth/login");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push("/api/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  if (authLoading) {
    return (
      <Container maxW="4xl" py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text>Loading...</Text>
        </VStack>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Container maxW="4xl" py={8}>
        <VStack spacing={6} textAlign="center">
          <Heading>Sign in to get started</Heading>
          <Text color="gray.600">
            Please sign in to begin your onboarding process.
          </Text>
          <Button as="a" href="/api/auth/login" colorScheme="teal" size="lg">
            Sign In
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">
          Welcome to Status Score
        </Heading>
        <Text fontSize="xl" textAlign="center">
          Let&apos;s get you started with these simple steps:
        </Text>
        <Progress value={(currentStep + 1) * 25} colorScheme="cyan" mb={8} />
        {steps.map((step, index) => (
          <Box
            key={index}
            p={6}
            borderWidth={1}
            borderColor={borderColor}
            borderRadius="lg"
            bg={bgColor}
            boxShadow={index === currentStep ? "lg" : "none"}
            opacity={index > currentStep ? 0.5 : 1}
          >
            <Flex align="center" mb={4}>
              <Icon
                as={step.icon}
                boxSize={8}
                color={aquamarineColors[4]}
                mr={4}
              />
              <Heading as="h3" size="lg">
                {step.title}
              </Heading>
            </Flex>
            <Text mb={4}>{step.description}</Text>
            <Button
              as={NextLink}
              href={step.link}
              bg={aquamarineColors[4]}
              color="gray.900"
              _hover={{ bg: aquamarineColors[300] }}
              isDisabled={index > currentStep}
            >
              {step.linkText}
            </Button>
          </Box>
        ))}
        {currentStep < steps.length - 1 && (
          <Button onClick={handleNextStep} alignSelf="center" mt={4}>
            Next Step
          </Button>
        )}
      </VStack>
    </Container>
  );
};

export default OnboardingPage;
