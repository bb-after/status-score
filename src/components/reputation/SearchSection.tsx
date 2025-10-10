import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Select,
  Text,
  Progress,
  FormControl,
  FormLabel,
  useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface SearchSectionProps {
  onSearch: (keyword: string, type: 'individual' | 'company' | 'public-figure') => void;
  onCompare: (keyword1: string, keyword2: string, type: 'individual' | 'company' | 'public-figure') => void;
  onDemo?: () => void;
  isSearching: boolean;
  searchProgress: number;
}

export function SearchSection({ onSearch, onCompare, onDemo, isSearching, searchProgress }: SearchSectionProps) {
  const [searchMode, setSearchMode] = useState<'search' | 'compare'>('search');
  const [keyword, setKeyword] = useState('');
  const [keyword1, setKeyword1] = useState('');
  const [keyword2, setKeyword2] = useState('');
  const [entityType, setEntityType] = useState<'individual' | 'company' | 'public-figure'>('individual');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Animation variants for buttons
  const buttonVariants = {
    hover: { 
      scale: 1.05, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      } 
    },
    tap: { 
      scale: 0.95,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }
    }
  };

  const demoButtonVariants = {
    hover: { 
      scale: 1.02,
      borderColor: "#319795",
      boxShadow: "0 4px 12px rgba(49, 151, 149, 0.2)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      } 
    },
    tap: { 
      scale: 0.98,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }
    }
  };

  const handleSearch = () => {
    if (searchMode === 'search' && keyword.trim()) {
      onSearch(keyword.trim(), entityType);
    } else if (searchMode === 'compare' && keyword1.trim() && keyword2.trim()) {
      onCompare(keyword1.trim(), keyword2.trim(), entityType);
    }
  };

  const canSearch = searchMode === 'search' 
    ? keyword.trim().length > 0 
    : keyword1.trim().length > 0 && keyword2.trim().length > 0;

  return (
    <Box
      bg={bgColor}
      rounded="xl"
      shadow="lg"
      border="1px"
      borderColor={borderColor}
      p={8}
      mb={8}
    >
      <VStack spacing={6}>
        {/* Header */}
        <VStack spacing={2} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
            Reputation Analysis Tool
          </Text>
          <Text color="gray.600">
            Analyze online reputation for individuals, companies, and public figures
          </Text>
        </VStack>

        {/* Mode Selector */}
        <HStack spacing={4}>
          <Button
            size="sm"
            variant={searchMode === 'search' ? 'solid' : 'outline'}
            colorScheme="teal"
            onClick={() => setSearchMode('search')}
          >
            Single Analysis
          </Button>
          <Text color="gray.400">or</Text>
          <Button
            size="sm"
            variant={searchMode === 'compare' ? 'solid' : 'outline'}
            colorScheme="teal"
            onClick={() => setSearchMode('compare')}
          >
            Compare Two
          </Button>
        </HStack>

        {/* Entity Type Selector */}
        <FormControl maxW="300px">
          <FormLabel>Entity Type</FormLabel>
          <Select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as typeof entityType)}
            bg="white"
          >
            <option value="individual">Individual</option>
            <option value="company">Company</option>
            <option value="public-figure">Public Figure</option>
          </Select>
        </FormControl>

        {/* Search Inputs */}
        {searchMode === 'search' ? (
          <VStack spacing={4} w="100%" maxW="600px">
            <FormControl>
              <FormLabel>Name or Company to Analyze</FormLabel>
              <Input
                placeholder="Enter name or company..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                size="lg"
                onKeyPress={(e) => e.key === 'Enter' && canSearch && handleSearch()}
              />
            </FormControl>
          </VStack>
        ) : (
          <VStack spacing={4} w="100%" maxW="600px">
            <HStack spacing={4} w="100%">
              <FormControl>
                <FormLabel>First Entity</FormLabel>
                <Input
                  placeholder="First entity to compare..."
                  value={keyword1}
                  onChange={(e) => setKeyword1(e.target.value)}
                  size="lg"
                />
              </FormControl>
              <Text fontSize="lg" color="gray.500" alignSelf="end" pb={2}>
                vs
              </Text>
              <FormControl>
                <FormLabel>Second Entity</FormLabel>
                <Input
                  placeholder="Second entity to compare..."
                  value={keyword2}
                  onChange={(e) => setKeyword2(e.target.value)}
                  size="lg"
                  onKeyPress={(e) => e.key === 'Enter' && canSearch && handleSearch()}
                />
              </FormControl>
            </HStack>
          </VStack>
        )}

        {/* Search Buttons */}
        <HStack spacing={4}>
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              colorScheme="teal"
              size="lg"
              onClick={handleSearch}
              isDisabled={!canSearch || isSearching}
              isLoading={isSearching}
              loadingText="Analyzing..."
              px={8}
            >
              {searchMode === 'search' ? 'Analyze Reputation' : 'Compare Reputations'}
            </Button>
          </motion.div>
          
          {onDemo && (
            <motion.div
              variants={demoButtonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="outline"
                colorScheme="teal"
                size="lg"
                onClick={onDemo}
                isDisabled={isSearching}
                px={6}
              >
                View Demo
              </Button>
            </motion.div>
          )}
        </HStack>

        {/* Progress Bar */}
        {isSearching && (
          <Box w="100%" maxW="400px">
            <Progress
              value={searchProgress}
              colorScheme="teal"
              size="lg"
              rounded="full"
              hasStripe
              isAnimated
            />
            <Text textAlign="center" fontSize="sm" color="gray.600" mt={2}>
              {searchProgress < 20 && 'Gathering data...'}
              {searchProgress >= 20 && searchProgress < 40 && 'Analyzing sources...'}
              {searchProgress >= 40 && searchProgress < 60 && 'Processing sentiment...'}
              {searchProgress >= 60 && searchProgress < 80 && 'Calculating score...'}
              {searchProgress >= 80 && searchProgress < 100 && 'Finalizing results...'}
              {searchProgress === 100 && 'Complete!'}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}