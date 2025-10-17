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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { ReputationDashboard } from "../components/reputation/ReputationDashboard";

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
      
      {/* Login Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign in to analyze reputation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text color="gray.600" textAlign="center">
                Create a free account to access our comprehensive reputation analysis tools for individuals, companies, and public figures.
              </Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Choose your preferred sign-in method:
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <VStack spacing={3} w="100%">
              <Button
                onClick={handleLogin}
                colorScheme="teal"
                size="lg"
                w="100%"
                leftIcon={<span>📊</span>}
              >
                Sign In with Google / Outlook
              </Button>
              <Text fontSize="xs" color="gray.400" textAlign="center">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </Text>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
