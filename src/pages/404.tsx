import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Input,
  VStack,
  Image,
  Flex,
} from "@chakra-ui/react";
import { Search } from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

const Custom404 = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Container maxW="4xl" py={20}>
      <VStack spacing={8} align="center">
        <Image
          src="https://status-score-public.s3.us-east-2.amazonaws.com/logo-1.png"
          alt="StatusScore Logo"
          width={100}
          height={100}
        />
        <Heading as="h1" size="2xl" textAlign="center" color="accent.neon">
          404 - Page Not Found
        </Heading>
        <Text fontSize="xl" textAlign="center">
          Oops! It seems the page you're looking for has vanished into the
          digital ether.
        </Text>
        <Box as="form" onSubmit={handleSearch} width="100%" maxW="md">
          <Flex>
            <Input
              placeholder="Search for content"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="lg"
              borderRightRadius="0"
            />
            <Button
              type="submit"
              size="lg"
              borderLeftRadius="0"
              bg="aquamarine.4"
              color="gray.900"
              _hover={{ bg: "aquamarine.300" }}
              leftIcon={<Search />}
            >
              Search
            </Button>
          </Flex>
        </Box>
        <Text>Or try these popular pages:</Text>
        <Flex wrap="wrap" justify="center" gap={4}>
          <Button as={NextLink} href="/" variant="outline" colorScheme="cyan">
            Home
          </Button>
          <Button
            as={NextLink}
            href="/dashboard"
            variant="outline"
            colorScheme="cyan"
          >
            Dashboard
          </Button>
          <Button
            as={NextLink}
            href="/add-keyword"
            variant="outline"
            colorScheme="cyan"
          >
            Add Keyword
          </Button>
          <Button
            as={NextLink}
            href="/keyword-analysis"
            variant="outline"
            colorScheme="cyan"
          >
            Keyword Analysis
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
};

export default Custom404;
