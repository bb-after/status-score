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
  useDisclosure,
} from "@chakra-ui/react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { ReputationDashboard } from "../components/reputation/ReputationDashboard";
import { AuthPrompt } from "../components/AuthPrompt";

export default function ReputationAnalysis() {
  const { user, isLoading } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const [originalSearch, setOriginalSearch] = useState<{
    keyword: string;
    type: "individual" | "company" | "public-figure";
  } | null>(null);

  const handleInterceptedSearch = (
    keyword: string,
    type: "individual" | "company" | "public-figure"
  ) => {
    if (!user?.isAuthenticated) {
      setOriginalSearch({ keyword, type });
      onOpen();
    }
  };

  const handleInterceptedCompare = (
    keyword1: string,
    keyword2: string,
    type: "individual" | "company" | "public-figure"
  ) => {
    if (!user?.isAuthenticated) {
      onOpen();
    }
  };

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

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

  return (
    <>
      <ReputationDashboard 
        onSearchIntercept={user?.isAuthenticated ? undefined : handleInterceptedSearch}
        onCompareIntercept={user?.isAuthenticated ? undefined : handleInterceptedCompare}
      />
      
      <AuthPrompt
        isOpen={isOpen}
        onClose={onClose}
        onLogin={handleLogin}
        title="Sign in to analyze reputation"
        description="Create a free account to access our comprehensive reputation analysis tools for individuals, companies, and public figures."
      />
    </>
  );
}
