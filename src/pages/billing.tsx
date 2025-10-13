// pages/billing.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Box, Button, Heading, Text, Stack, useToast, Container, VStack, Spinner } from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";

const BillingPage = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubscribe = async (priceId: string) => {
    try {
      setIsLoading(true);

      const response = await axios.post("/api/stripe/create-checkout-session", {
        priceId,
      });

      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout process",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Container maxW="4xl" py={8}>
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
          <Heading>Sign in to manage billing</Heading>
          <Text color="gray.600">
            Please sign in to view and manage your subscription plans.
          </Text>
          <Button as="a" href="/api/auth/login" colorScheme="teal" size="lg">
            Sign In
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Box maxW="4xl" mx="auto" py={8} px={4}>
      <Heading mb={6}>Subscription Plans</Heading>
      <Stack spacing={8} direction={["column", "row"]}>
        {/* Basic Plan */}
        <Box p={6} border="1px" borderColor="gray.200" borderRadius="lg">
          <Heading size="md">Basic Plan</Heading>
          <Text fontSize="2xl" fontWeight="bold" my={4}>
            $9.99/month
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => handleSubscribe("price_XXXXX")}
            isLoading={isLoading}
          >
            Subscribe
          </Button>
        </Box>

        {/* Pro Plan */}
        <Box p={6} border="1px" borderColor="gray.200" borderRadius="lg">
          <Heading size="md">Pro Plan</Heading>
          <Text fontSize="2xl" fontWeight="bold" my={4}>
            $19.99/month
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => handleSubscribe("price_YYYYY")}
            isLoading={isLoading}
          >
            Subscribe
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default BillingPage;
