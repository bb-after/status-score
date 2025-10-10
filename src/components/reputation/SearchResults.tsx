import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Link,
  Collapse,
} from "@chakra-ui/react";
import { SearchResult } from "./ReputationDashboard";

interface SearchResultsProps {
  keyword: string;
  results: SearchResult[];
  isVisible: boolean;
}

export function SearchResults({
  keyword,
  results,
  isVisible,
}: SearchResultsProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "green";
      case "negative":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Collapse in={isVisible} animateOpacity>
      <Box
        bg="white"
        rounded="xl"
        shadow="sm"
        border="1px"
        borderColor="gray.200"
        p={6}
        mb={8}
        mx={6}
      >
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold" color="gray.900">
            Search Results for &ldquo;{keyword}&rdquo;
          </Text>

          <Text fontSize="sm" color="gray.600">
            Found {results.length} results
          </Text>

          <VStack spacing={3} align="stretch">
            {results.slice(0, 10).map((result, index) => (
              <Box
                key={index}
                p={4}
                border="1px"
                borderColor="gray.100"
                rounded="lg"
                _hover={{ borderColor: "gray.300" }}
              >
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between" align="start">
                    <VStack align="stretch" spacing={1} flex={1}>
                      <Link
                        href={result.url}
                        isExternal
                        fontSize="sm"
                        fontWeight="semibold"
                        color="blue.600"
                        _hover={{ textDecoration: "underline" }}
                      >
                        {result.title}
                      </Link>
                      <Text fontSize="xs" color="gray.500">
                        {result.source} • Rank #{result.rank}
                      </Text>
                    </VStack>
                    <Badge
                      colorScheme={getSentimentColor(result.sentiment)}
                      size="sm"
                    >
                      {result.sentiment}
                    </Badge>
                  </HStack>

                  <Text fontSize="sm" color="gray.600">
                    {result.snippet}
                  </Text>
                </VStack>
              </Box>
            ))}
          </VStack>

          {results.length > 10 && (
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Showing first 10 of {results.length} results
            </Text>
          )}
        </VStack>
      </Box>
    </Collapse>
  );
}
