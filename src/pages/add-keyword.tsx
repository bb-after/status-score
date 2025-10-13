// pages/add-keyword.tsx
import { Box, Heading, Text, Container, VStack, Spinner, Button } from "@chakra-ui/react";
import AddKeywordForm from "../components/AddKeywordForm";
import { useAuth } from "../contexts/AuthContext";

const AddKeywordPage = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Container maxW="2xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text>Loading...</Text>
        </VStack>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Container maxW="2xl" py={8}>
        <VStack spacing={6} textAlign="center">
          <Heading>Sign in to add keywords</Heading>
          <Text color="gray.600">
            Please sign in to add new keywords for tracking and analysis.
          </Text>
          <Button as="a" href="/api/auth/login" colorScheme="teal" size="lg">
            Sign In
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Box maxW="2xl" mx="auto" py="12" px="6">
      <Heading as="h2" size="xl" textAlign="center" mb={6}>
        Add a New Keyword
      </Heading>
      <Text textAlign="center" color="gray.600" mb={8}>
        Enter a new keyword that you would like to track. We will monitor its
        sentiment and provide detailed reports.
      </Text>
      <AddKeywordForm />
    </Box>
  );
};

export default AddKeywordPage;
