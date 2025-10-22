import { useState } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Icon,
  useToast,
  List,
  ListItem,
  ListIcon,
  Badge,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import {
  CheckIcon,
  StarIcon,
  RepeatIcon,
  SearchIcon,
  ArrowForwardIcon,
} from "@chakra-ui/icons";
import { useUser } from "@auth0/nextjs-auth0/client";
import { ProtectedRoute } from "../components/ProtectedRoute";

const features = [
  {
    icon: RepeatIcon,
    title: "Automatic Updates",
    description: "Your reputation scores are automatically updated weekly",
    detail:
      "Set it and forget it - we'll track your progress and send you weekly reports",
  },
  {
    icon: SearchIcon,
    title: "GEO Reputation Checker",
    description: "Analyze your reputation from different geographic locations",
    detail:
      "See how your brand appears to customers in different cities and regions",
  },
  {
    icon: CheckIcon,
    title: "Score Comparison",
    description: "Compare scores between different keywords or time periods",
    detail: "Track improvement over time and benchmark against competitors",
  },
  {
    icon: StarIcon,
    title: "Priority Support",
    description: "Get priority customer support and feature requests",
    detail: "Direct line to our team for questions and feature suggestions",
  },
];

export default function UpgradePage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleUpgrade = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId:
            process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_1234567890", // Replace with your actual price ID
          successUrl: `${window.location.origin}/dashboard?upgrade=success`,
          cancelUrl: `${window.location.origin}/upgrade?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Unable to start upgrade process. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute
      title="Sign in to upgrade"
      description="Please sign in to upgrade to our premium plan and unlock advanced features."
    >
      <Container maxW="6xl" py={12}>
        <VStack spacing={12} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Badge
              colorScheme="teal"
              px={3}
              py={1}
              rounded="full"
              fontSize="sm"
            >
              Premium Plan
            </Badge>
            <Heading size="2xl" color="gray.900">
              Unlock Advanced Reputation Management
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Take your reputation monitoring to the next level with automated
              tracking, geographic analysis, and comparison tools.
            </Text>
          </VStack>

          {/* Pricing Card */}
          <Box display="flex" justifyContent="center">
            <Card
              maxW="md"
              shadow="xl"
              borderWidth="2px"
              borderColor="teal.200"
            >
              <CardHeader textAlign="center" pb={2}>
                <VStack spacing={2}>
                  <Heading size="lg" color="teal.600">
                    Premium Plan
                  </Heading>
                  <HStack align="baseline" justify="center">
                    <Text fontSize="5xl" fontWeight="bold" color="gray.900">
                      $49
                    </Text>
                    <Text fontSize="xl" color="gray.500">
                      /month
                    </Text>
                  </HStack>
                  <Text color="gray.600">
                    Everything you need for professional reputation management
                  </Text>
                </VStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={6}>
                  <Button
                    size="lg"
                    colorScheme="teal"
                    onClick={handleUpgrade}
                    isLoading={loading}
                    loadingText="Processing..."
                    rightIcon={<ArrowForwardIcon />}
                    w="full"
                  >
                    Upgrade Now
                  </Button>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Start your premium experience today. Cancel anytime.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* Features Grid */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {features.map((feature, index) => (
              <Card key={index} shadow="md" borderWidth="1px">
                <CardBody>
                  <HStack spacing={4} align="start">
                    <Box
                      p={3}
                      bg="teal.100"
                      rounded="lg"
                      color="teal.600"
                      flexShrink={0}
                    >
                      <Icon as={feature.icon} boxSize={6} />
                    </Box>
                    <VStack align="start" spacing={2}>
                      <Heading size="md" color="gray.900">
                        {feature.title}
                      </Heading>
                      <Text color="gray.700" fontWeight="medium">
                        {feature.description}
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        {feature.detail}
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          <Divider />

          {/* Free vs Premium Comparison */}
          <VStack spacing={6}>
            <Heading size="lg" textAlign="center" color="gray.900">
              What&apos;s Included
            </Heading>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
              {/* Free Plan */}
              <Card>
                <CardHeader>
                  <Heading size="md" color="gray.600">
                    Free Plan
                  </Heading>
                </CardHeader>
                <CardBody>
                  <List spacing={3}>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="gray.400" />
                      Basic reputation analysis
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="gray.400" />
                      Manual score updates
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="gray.400" />
                      Search history
                    </ListItem>
                    <ListItem color="gray.500">
                      <Text as="s">Automatic updates</Text>
                    </ListItem>
                    <ListItem color="gray.500">
                      <Text as="s">GEO reputation checking</Text>
                    </ListItem>
                    <ListItem color="gray.500">
                      <Text as="s">Score comparison</Text>
                    </ListItem>
                  </List>
                </CardBody>
              </Card>

              {/* Premium Plan */}
              <Card
                borderWidth="2px"
                borderColor="teal.200"
                position="relative"
              >
                <Badge
                  colorScheme="teal"
                  position="absolute"
                  top="-10px"
                  left="50%"
                  transform="translateX(-50%)"
                  px={3}
                  py={1}
                >
                  RECOMMENDED
                </Badge>
                <CardHeader>
                  <Heading size="md" color="teal.600">
                    Premium Plan
                  </Heading>
                </CardHeader>
                <CardBody>
                  <List spacing={3}>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="teal.500" />
                      Everything in Free
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="teal.500" />
                      <Text fontWeight="semibold">
                        Automatic weekly updates
                      </Text>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="teal.500" />
                      <Text fontWeight="semibold">GEO reputation checker</Text>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="teal.500" />
                      <Text fontWeight="semibold">Score comparison tools</Text>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="teal.500" />
                      Priority customer support
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="teal.500" />
                      Advanced analytics & insights
                    </ListItem>
                  </List>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </VStack>
      </Container>
    </ProtectedRoute>
  );
}
