import { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  Text,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { ReputationDashboard } from "../components/reputation/ReputationDashboard";

export default function ReputationAnalysis() {
  const { user, isLoading } = useUser();
  const toast = useToast();

  if (isLoading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text>Loading...</Text>
        </VStack>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={6} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold">
            Sign in to analyze reputation
          </Text>
          <Text color="gray.600">
            Access reputation analysis tools for individuals, companies, and
            public figures.
          </Text>
          <Button as="a" href="/api/auth/login" colorScheme="teal" size="lg">
            Sign In
          </Button>
        </VStack>
      </Container>
    );
  }

  return <ReputationDashboard />;
}
