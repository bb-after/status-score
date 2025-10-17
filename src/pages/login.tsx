import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    router.push('/api/auth/login');
  }, [router]);

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={4}>
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text color="gray.600" fontSize="lg">
          Redirecting to login...
        </Text>
      </VStack>
    </Box>
  );
}