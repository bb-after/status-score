import { ReactNode } from "react";
import {
  Container,
  VStack,
  Text,
  Button,
  Spinner,
  Heading,
} from "@chakra-ui/react";
import { useUser } from '@auth0/nextjs-auth0/client';

interface ProtectedRouteProps {
  children: ReactNode;
  title: string;
  description: string;
  loadingMessage?: string;
}

export function ProtectedRoute({ 
  children, 
  title, 
  description, 
  loadingMessage = "Loading..." 
}: ProtectedRouteProps) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text>{loadingMessage}</Text>
        </VStack>
      </Container>
    );
  }

  if (!user || !user.isAuthenticated) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={6} textAlign="center">
          <Heading>{title}</Heading>
          <Text color="gray.600" maxW="2xl">
            {description}
          </Text>
          <Button as="a" href="/api/auth/login" colorScheme="teal" size="lg">
            Sign In
          </Button>
        </VStack>
      </Container>
    );
  }

  return <>{children}</>;
}