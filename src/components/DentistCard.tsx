import React from 'react';
import {
  Box,
  Image,
  Heading,
  Text,
  Flex,
  Icon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  VStack,
  HStack,
  Badge,
  Progress,
  Divider,
  Link,
  Tooltip,
  Avatar
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { FaStar } from 'react-icons/fa';
import { FiTrendingUp, FiTrendingDown, FiExternalLink, FiAlertTriangle } from 'react-icons/fi';
import { DentistResult } from '../types/types';

interface DentistCardProps {
  dentist: DentistResult;
}

// Calculate reputation score based on various factors
const calculateReputationScore = (dentist: DentistResult): number => {
  // Weight factors
  const ratingWeight = 0.40;
  const reviewCountWeight = 0.30;
  const negativeReviewWeight = 0.30;
  
  // Normalize rating (0-5 scale to 0-100)
  const normalizedRating = (dentist.rating / 5) * 100;
  
  // Normalize review count (logarithmic scale)
  const normalizedReviewCount = Math.min(100, 20 * Math.log10(dentist.totalReviews + 1));
  
  // Calculate negative review impact (100 - percentage of negative reviews * 100)
  const negativeReviewCount = dentist.negativeReviews?.length || 0;
  const negativeReviewPercentage = dentist.totalReviews > 0 
    ? (negativeReviewCount / dentist.totalReviews) 
    : 0;
  const negativeReviewImpact = 100 - (negativeReviewPercentage * 100);
  
  // Calculate weighted score
  const score = 
    normalizedRating * ratingWeight +
    normalizedReviewCount * reviewCountWeight +
    negativeReviewImpact * negativeReviewWeight;
  
  return Math.round(score);
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'green';
  if (score >= 70) return 'blue';
  if (score >= 60) return 'yellow';
  if (score >= 50) return 'orange';
  return 'red';
};

export function DentistCard({ dentist }: DentistCardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Calculate reputation score
  const reputationScore = calculateReputationScore(dentist);
  const industryAverage = 75; // Default industry average
  const scoreDelta = reputationScore - industryAverage;
  const scoreColor = getScoreColor(reputationScore);
  
  // Sample metrics for visualization
  const websiteScore = Math.round(70 + Math.random() * 20);
  const socialScore = Math.round(60 + Math.random() * 30);
  const contentScore = Math.round(65 + Math.random() * 25);
  
  return (
    <>
      <Box 
        borderWidth="1px"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="lg"
        bg="white"
        transition="all 0.3s"
        _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl' }}
        position="relative"
      >
        {dentist.negativeReviews?.length > 2 && (
          <Box position="absolute" top="0" right="0" m={2}>
            <Tooltip label="Reputation risk detected">
              <Box>
                <Icon as={FiAlertTriangle} color="orange.500" boxSize={5} />
              </Box>
            </Tooltip>
          </Box>
        )}
        
        <Flex direction={{ base: 'column', md: 'row' }}>
          {/* Left Section - Main Profile */}
          <Box p={6} flex="1">
            <HStack spacing={4} align="flex-start" mb={4}>
              {dentist.photoUrl ? (
                <Image
                  src={dentist.photoUrl}
                  alt={dentist.name}
                  boxSize="80px"
                  borderRadius="md"
                  objectFit="cover"
                />
              ) : (
                <Avatar size="xl" name={dentist.name} />
              )}
              
              <VStack align="flex-start" spacing={1}>
                <Heading size="md">{dentist.name}</Heading>
                <Text color="gray.600" fontSize="sm" noOfLines={2}>{dentist.address}</Text>
                <HStack spacing={1} mt={1}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      color={i < Math.floor(dentist.rating) ? 'yellow.400' : 'gray.300'} 
                      boxSize={3}
                    />
                  ))}
                  <Text fontSize="xs" fontWeight="bold" ml={1}>
                    {dentist.rating.toFixed(1)} ({dentist.totalReviews} reviews)
                  </Text>
                </HStack>
              </VStack>
            </HStack>
            
            <Link 
              href={`https://www.google.com/maps/place/?q=place_id:${dentist.placeId}`}
              isExternal 
              fontSize="sm" 
              color="blue.500" 
              display="flex" 
              alignItems="center" 
              mb={4}
            >
              <Icon as={FiExternalLink} mr={1} boxSize={3} />
              View on Google Maps
            </Link>
            
            <Divider mb={4} />
            
            {/* Score components */}
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="medium">Reviews</Text>
                <Badge colorScheme={getScoreColor(dentist.rating * 20)}>
                  {dentist.rating.toFixed(1)}/5.0
                </Badge>
              </HStack>
              <Progress 
                value={dentist.rating * 20} 
                colorScheme={getScoreColor(dentist.rating * 20)} 
                size="sm" 
                borderRadius="full" 
                height="6px"
              />
              
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="medium">Social Media</Text>
                <Badge colorScheme={getScoreColor(socialScore)}>
                  {socialScore}/100
                </Badge>
              </HStack>
              <Progress 
                value={socialScore} 
                colorScheme={getScoreColor(socialScore)} 
                size="sm" 
                borderRadius="full" 
                height="6px"
              />
              
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="medium">Online Content</Text>
                <Badge colorScheme={getScoreColor(contentScore)}>
                  {contentScore}/100
                </Badge>
              </HStack>
              <Progress 
                value={contentScore} 
                colorScheme={getScoreColor(contentScore)} 
                size="sm" 
                borderRadius="full" 
                height="6px"
              />
            </VStack>
          </Box>
          
          {/* Right Section - Reputation Score */}
          <Flex 
            direction="column" 
            justify="center" 
            align="center" 
            p={6} 
            bg={`${scoreColor}.50`} 
            minW="180px"
            borderLeftWidth={{ base: 0, md: '1px' }}
            borderTopWidth={{ base: '1px', md: 0 }}
            borderColor="gray.200"
          >
            <Text fontSize="sm" fontWeight="medium" mb={1}>Reputation Score</Text>
            <Heading 
              size="3xl" 
              color={`${scoreColor}.500`}
              mb={2}
            >
              {reputationScore}
            </Heading>
            
            <Badge 
              colorScheme={scoreColor} 
              fontSize="md" 
              borderRadius="full" 
              px={3} 
              py={1}
              mb={4}
            >
              {reputationScore >= 80 ? 'Excellent' : 
              reputationScore >= 70 ? 'Good' : 
              reputationScore >= 60 ? 'Fair' : 
              reputationScore >= 50 ? 'Poor' : 'Critical'}
            </Badge>
            
            <HStack spacing={1}>
              <Icon 
                as={scoreDelta >= 0 ? FiTrendingUp : FiTrendingDown} 
                color={scoreDelta >= 0 ? 'green.500' : 'red.500'} 
              />
              <Text 
                fontSize="sm" 
                fontWeight="bold" 
                color={scoreDelta >= 0 ? 'green.500' : 'red.500'}
              >
                {scoreDelta >= 0 ? '+' : ''}{scoreDelta} vs. avg
              </Text>
            </HStack>
            
            {dentist.negativeReviews?.length > 0 && (
              <Button 
                mt={6} 
                colorScheme="red" 
                size="sm" 
                width="full"
                onClick={onOpen}
              >
                {dentist.negativeReviews.length} Negative Review{dentist.negativeReviews?.length !== 1 ? 's' : ''}
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Modal to show negative reviews */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Negative Reviews for {dentist.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {dentist.negativeReviews?.length > 0 ? (
              dentist.negativeReviews.map((review, index) => (
                <Box key={index} mb={4} p={4} borderRadius="md" bg="red.50">
                  <HStack mb={2}>
                    <Badge colorScheme="red">{review.rating} stars</Badge>
                    <Text fontSize="sm" fontWeight="bold">
                      {review.author_name}
                    </Text>
                  </HStack>
                  <Text fontSize="sm">{review.text}</Text>
                  <Divider my={2} />
                  <Text fontSize="xs" color="gray.500">
                    Reputation Impact: Moderate
                  </Text>
                </Box>
              ))
            ) : (
              <Text fontSize="sm" color="gray.600">
                No negative reviews found.
              </Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
