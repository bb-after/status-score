import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  CircularProgress,
  CircularProgressLabel,
  SimpleGrid,
  Badge,
  Flex
} from '@chakra-ui/react';

interface ComparisonViewProps {
  entity1: {
    keyword: string;
    score: number;
    data: any;
    results?: Array<{
      url: string;
      title: string;
      snippet: string;
      sentiment: 'positive' | 'neutral' | 'negative';
      source: string;
      rank: number;
    }>;
  };
  entity2: {
    keyword: string;
    score: number;
    data: any;
    results?: Array<{
      url: string;
      title: string;
      snippet: string;
      sentiment: 'positive' | 'neutral' | 'negative';
      source: string;
      rank: number;
    }>;
  };
  type: 'individual' | 'company' | 'public-figure';
  onClose: () => void;
}

export function ComparisonView({ entity1, entity2, type, onClose }: ComparisonViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const winner = entity1.score > entity2.score ? entity1 : entity2;

  return (
    <Box
      bg="white"
      rounded="xl"
      shadow="lg"
      border="1px"
      borderColor="gray.200"
      p={6}
      mb={8}
    >
      <VStack spacing={6}>
        <HStack justify="space-between" w="100%">
          <Text fontSize="xl" fontWeight="bold" color="gray.900">
            Reputation Comparison
          </Text>
          <Button onClick={onClose} variant="ghost" size="sm">
            ✕ Close
          </Button>
        </HStack>

        {/* Winner Banner */}
        <Box bg="green.50" border="1px" borderColor="green.200" rounded="lg" p={4} w="100%">
          <Text textAlign="center" color="green.700">
            🏆 <strong>{winner.keyword}</strong> has the higher reputation score ({winner.score}/100)
          </Text>
        </Box>

        {/* Side by Side Comparison */}
        <SimpleGrid columns={2} spacing={8} w="100%">
          {/* Entity 1 */}
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              {entity1.keyword}
            </Text>
            
            <CircularProgress
              value={entity1.score}
              size="120px"
              thickness="8px"
              color={`${getScoreColor(entity1.score)}.400`}
              trackColor="gray.100"
            >
              <CircularProgressLabel fontSize="xl" fontWeight="bold">
                {entity1.score}
              </CircularProgressLabel>
            </CircularProgress>

            <Badge
              colorScheme={getScoreColor(entity1.score)}
              size="lg"
              px={3}
              py={1}
              rounded="full"
            >
              {getScoreLabel(entity1.score)}
            </Badge>

            <VStack spacing={2} align="stretch" w="100%">
              <HStack justify="space-between">
                <Text fontSize="sm">Positive Articles:</Text>
                <Text fontSize="sm" fontWeight="bold">{entity1.data.positiveArticles}</Text>
              </HStack>
              {type !== 'individual' && (
                <HStack justify="space-between">
                  <Text fontSize="sm">Wikipedia Presence:</Text>
                  <Text fontSize="sm" fontWeight="bold">{entity1.data.wikipediaPresence}</Text>
                </HStack>
              )}
              <HStack justify="space-between">
                <Text fontSize="sm">Owned Assets:</Text>
                <Text fontSize="sm" fontWeight="bold">{entity1.data.ownedAssets}%</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="red.500">Negative Links:</Text>
                <Text fontSize="sm" fontWeight="bold" color="red.500">{entity1.data.negativeLinks}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">Social Presence:</Text>
                <Text fontSize="sm" fontWeight="bold">{entity1.data.socialPresence}%</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">AI Overviews:</Text>
                <Text fontSize="sm" fontWeight="bold">{entity1.data.aiOverviews}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">GEO Presence:</Text>
                <Text fontSize="sm" fontWeight="bold">{entity1.data.geoPresence}%</Text>
              </HStack>
            </VStack>
          </VStack>

          {/* VS Divider */}
          <Box display={{ base: 'none', md: 'flex' }} alignItems="center" justifyContent="center">
            <Text fontSize="2xl" fontWeight="bold" color="gray.400">
              VS
            </Text>
          </Box>

          {/* Entity 2 */}
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              {entity2.keyword}
            </Text>
            
            <CircularProgress
              value={entity2.score}
              size="120px"
              thickness="8px"
              color={`${getScoreColor(entity2.score)}.400`}
              trackColor="gray.100"
            >
              <CircularProgressLabel fontSize="xl" fontWeight="bold">
                {entity2.score}
              </CircularProgressLabel>
            </CircularProgress>

            <Badge
              colorScheme={getScoreColor(entity2.score)}
              size="lg"
              px={3}
              py={1}
              rounded="full"
            >
              {getScoreLabel(entity2.score)}
            </Badge>

            <VStack spacing={2} align="stretch" w="100%">
              <HStack justify="space-between">
                <Text fontSize="sm">Positive Articles:</Text>
                <Text fontSize="sm" fontWeight="bold">{entity2.data.positiveArticles}</Text>
              </HStack>
              {type !== 'individual' && (
                <HStack justify="space-between">
                  <Text fontSize="sm">Wikipedia Presence:</Text>
                  <Text fontSize="sm" fontWeight="bold">{entity2.data.wikipediaPresence}</Text>
                </HStack>
              )}
              <HStack justify="space-between">
                <Text fontSize="sm">Owned Assets:</Text>
                <Text fontSize="sm" fontWeight="bold">{entity2.data.ownedAssets}%</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="red.500">Negative Links:</Text>
                <Text fontSize="sm" fontWeight="bold" color="red.500">{entity2.data.negativeLinks}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">Social Presence:</Text>
                <Text fontSize="sm" fontWeight="bold">{entity2.data.socialPresence}%</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">AI Overviews:</Text>
                <Text fontSize="sm" fontWeight="bold">{entity2.data.aiOverviews}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">GEO Presence:</Text>
                <Text fontSize="sm" fontWeight="bold">{entity2.data.geoPresence}%</Text>
              </HStack>
            </VStack>
          </VStack>
        </SimpleGrid>

        {/* Analysis Summary */}
        <Box bg="gray.50" rounded="lg" p={4} w="100%">
          <Text fontSize="sm" color="gray.700" textAlign="center">
            <strong>Analysis:</strong> The {Math.abs(entity1.score - entity2.score)} point difference 
            is {Math.abs(entity1.score - entity2.score) > 20 ? 'significant' : Math.abs(entity1.score - entity2.score) > 5 ? 'moderate' : 'minimal'}. 
            Key factors: {(() => {
              const factors: string[] = [];
              
              // Compare negative content
              if (entity1.data.negativeLinks > entity2.data.negativeLinks) {
                factors.push(`${entity1.keyword} has more negative content (${entity1.data.negativeLinks} vs ${entity2.data.negativeLinks})`);
              } else if (entity2.data.negativeLinks > entity1.data.negativeLinks) {
                factors.push(`${entity2.keyword} has more negative content (${entity2.data.negativeLinks} vs ${entity1.data.negativeLinks})`);
              }
              
              // Compare positive articles
              if (entity1.data.positiveArticles > entity2.data.positiveArticles) {
                factors.push(`${entity1.keyword} has more positive coverage (${entity1.data.positiveArticles} vs ${entity2.data.positiveArticles})`);
              } else if (entity2.data.positiveArticles > entity1.data.positiveArticles) {
                factors.push(`${entity2.keyword} has more positive coverage (${entity2.data.positiveArticles} vs ${entity1.data.positiveArticles})`);
              }
              
              // Compare social presence if significant difference
              if (Math.abs(entity1.data.socialPresence - entity2.data.socialPresence) > 15) {
                const higher = entity1.data.socialPresence > entity2.data.socialPresence ? entity1.keyword : entity2.keyword;
                factors.push(`${higher} has stronger social presence`);
              }
              
              // Compare owned assets if significant difference
              if (Math.abs(entity1.data.ownedAssets - entity2.data.ownedAssets) > 20) {
                const higher = entity1.data.ownedAssets > entity2.data.ownedAssets ? entity1.keyword : entity2.keyword;
                factors.push(`${higher} has more owned digital assets`);
              }
              
              if (factors.length === 0) {
                return "Both entities have similar reputation profiles";
              }
              
              return factors.join(', ');
            })()}
          </Text>
        </Box>

        {/* Search Results Comparison */}
        {(entity1.results && entity1.results.length > 0) && (entity2.results && entity2.results.length > 0) && (
          <Box w="100%">
            <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={4} textAlign="center">
              Search Results Comparison
            </Text>
            
            <SimpleGrid columns={2} spacing={6} w="100%">
              {/* Entity 1 Results */}
              <VStack spacing={3} align="stretch">
                <Text fontSize="md" fontWeight="semibold" color="gray.700" textAlign="center">
                  {entity1.keyword} - Top Results
                </Text>
                {entity1.results?.slice(0, 3).map((result, index) => (
                  <Box
                    key={index}
                    p={3}
                    border="1px"
                    borderColor="gray.200"
                    rounded="md"
                    bg="white"
                  >
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between" align="start">
                        <Text fontSize="xs" fontWeight="semibold" color="blue.600" noOfLines={1}>
                          {result.title}
                        </Text>
                        <Badge
                          colorScheme={
                            result.sentiment === 'positive' 
                              ? 'green' 
                              : result.sentiment === 'negative' 
                              ? 'red' 
                              : 'gray'
                          }
                          size="sm"
                        >
                          {result.sentiment}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {result.snippet}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {result.source} • Rank #{result.rank}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </VStack>

              {/* Entity 2 Results */}
              <VStack spacing={3} align="stretch">
                <Text fontSize="md" fontWeight="semibold" color="gray.700" textAlign="center">
                  {entity2.keyword} - Top Results
                </Text>
                {entity2.results?.slice(0, 3).map((result, index) => (
                  <Box
                    key={index}
                    p={3}
                    border="1px"
                    borderColor="gray.200"
                    rounded="md"
                    bg="white"
                  >
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between" align="start">
                        <Text fontSize="xs" fontWeight="semibold" color="blue.600" noOfLines={1}>
                          {result.title}
                        </Text>
                        <Badge
                          colorScheme={
                            result.sentiment === 'positive' 
                              ? 'green' 
                              : result.sentiment === 'negative' 
                              ? 'red' 
                              : 'gray'
                          }
                          size="sm"
                        >
                          {result.sentiment}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {result.snippet}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {result.source} • Rank #{result.rank}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </SimpleGrid>
          </Box>
        )}
      </VStack>
    </Box>
  );
}