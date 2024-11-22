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
} from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';
import { DentistResult } from '../types/types';

interface DentistCardProps {
  dentist: DentistResult;
}

export function DentistCard({ dentist }: DentistCardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  console.log('Dentist Data:', dentist);

  return (
    <>
      <Box
        borderWidth="1px"
        borderRadius="md"
        overflow="hidden"
        boxShadow="md"
        p={4}
        bg="white"
        _hover={{ boxShadow: 'lg', transform: 'scale(1.02)' }}
        transition="transform 0.2s"
      >
        {dentist.photoUrl && (
          <Image
            src={dentist.photoUrl}
            alt={dentist.name}
            height="160px"
            objectFit="cover"
            borderRadius="md"
            mb={4}
          />
        )}
        <Heading as="h3" size="md" mb={2} isTruncated>
          {dentist.name}
        </Heading>
        <Flex alignItems="center" mb={2}>
          <Flex>
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                as={FaStar}
                color={i < Math.round(dentist.rating) ? 'yellow.400' : 'gray.300'}
                boxSize={4}
              />
            ))}
          </Flex>
          <Text ml={2} fontSize="sm" color="gray.600">
            {dentist.rating.toFixed(1)} ({dentist.totalReviews} reviews)
          </Text>
        </Flex>
        <Text fontSize="sm" color="gray.600" noOfLines={2}>
          {dentist.address}
        </Text>

        {/* Only show the negative reviews button if there are any */}
        {dentist.negativeReviews?.length > 0 && (
          <Flex justifyContent="space-between" alignItems="center" mt={4}>
            <Button size="sm" colorScheme="red" onClick={onOpen}>
              {dentist.negativeReviews.length} Negative Review{dentist.negativeReviews?.length !== 1 ? 's' : ''}
            </Button>
            <Button
              size="sm"
              as="a"
              href={`https://www.google.com/maps/place/?q=place_id:${dentist.placeId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Google
            </Button>
          </Flex>
        )}
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
                <Box key={index} mb={4} borderBottomWidth="1px" pb={2}>
                  <Text fontSize="sm" color="gray.600">
                    <strong>{review.author_name}</strong> ({review.rating} stars):
                  </Text>
                  <Text fontSize="sm">{review.text}</Text>
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
