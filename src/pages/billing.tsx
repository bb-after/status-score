// pages/billing.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Box, Button, Heading, Text, Stack, useToast } from "@chakra-ui/react";

const BillingPage = () => {
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
