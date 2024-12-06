import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
  Box,
  Heading,
  Button,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, SearchIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { useRouter } from "next/router";

interface Keyword {
  id: number;
  name: string;
  createdAt: string;
  reportCount: number;
}

const KeywordsPage = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

  const aquamarineColors = {
    4: "#00f8ba",
    300: "#00e5aa",
    500: "#00d299",
    700: "#00bf88",
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      const response = await axios.get("/api/keywords");
      setKeywords(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching keywords:", err);
      setError("Failed to fetch keywords. Please try again.");
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/api/keywords/${id}`);
      if (response.status === 200) {
        setKeywords(keywords.filter((keyword) => keyword.id !== id));
        toast({
          title: "Keyword deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to delete keyword");
      }
    } catch (err) {
      console.error("Error deleting keyword:", err);
      toast({
        title: "Failed to delete keyword",
        description:
          err.response?.data?.error || "An unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Layout>
      <Box maxW="6xl" mx="auto" py="12" px="6">
        <VStack spacing={8} align="stretch">
          <HStack justifyContent="space-between">
            <Heading as="h2" size="xl">
              Keywords
            </Heading>
            <Button
              as={NextLink}
              href="/add-keyword"
              leftIcon={<AddIcon />}
              bg={aquamarineColors[4]}
              color="gray.900"
              _hover={{ bg: aquamarineColors[300] }}
            >
              Add New Keyword
            </Button>
          </HStack>

          {loading && <Text>Loading keywords...</Text>}
          {error && <Text color="red.500">{error}</Text>}

          {!loading && !error && (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Keyword</Th>
                  <Th>Created At</Th>
                  <Th>Total Reports</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {keywords.map((keyword) => (
                  <Tr key={keyword.id}>
                    <Td>{keyword.name}</Td>
                    <Td>{new Date(keyword.createdAt).toLocaleDateString()}</Td>
                    <Td>{keyword.reportCount}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          as={NextLink}
                          href={`/keyword-analysis?keywordId=${keyword.id}`}
                          size="sm"
                          leftIcon={<SearchIcon />}
                          colorScheme="blue"
                        >
                          Analyze
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<DeleteIcon />}
                          colorScheme="red"
                          onClick={() => handleDelete(keyword.id)}
                        >
                          Delete
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {!loading && !error && keywords.length === 0 && (
            <Text textAlign="center">
              No keywords found. Add your first keyword to get started!
            </Text>
          )}
        </VStack>
      </Box>
    </Layout>
  );
};

export default KeywordsPage;
