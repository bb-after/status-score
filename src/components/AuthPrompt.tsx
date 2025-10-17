import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
  Icon,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaGoogle, FaMicrosoft, FaShieldAlt, FaRocket, FaChartLine } from 'react-icons/fa';

interface AuthPromptProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onLogin: () => void;
}

export function AuthPrompt({ 
  isOpen, 
  onClose, 
  title = "Sign in to analyze reputation",
  description = "Create a free account to access our comprehensive reputation analysis tools for individuals, companies, and public figures.",
  onLogin 
}: AuthPromptProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const featureBg = useColorModeValue('gray.50', 'gray.700');
  const featureBorderColor = useColorModeValue('gray.100', 'gray.600');

  // Animation variants matching SearchSection
  const buttonVariants = {
    hover: { 
      scale: 1.02,
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

  const iconVariants = {
    hover: { 
      rotate: [0, -10, 10, 0],
      transition: { 
        duration: 0.5
      } 
    }
  };

  const features = [
    { icon: FaChartLine, text: "Comprehensive scoring across 6 factors" },
    { icon: FaShieldAlt, text: "Track positive & negative mentions" },
    { icon: FaRocket, text: "Get actionable improvement insights" }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        bg={bgColor}
        borderRadius="xl"
        border="1px"
        borderColor={borderColor}
        shadow="2xl"
        mx={4}
      >
        <ModalHeader pb={2}>
          <VStack spacing={2} textAlign="center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                {title}
              </Text>
            </motion.div>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody px={8} pb={2}>
          <VStack spacing={6}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Text color="gray.600" textAlign="center" lineHeight="1.6">
                {description}
              </Text>
            </motion.div>

            {/* Features Grid */}
            <VStack spacing={4} w="100%">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + (index * 0.1), duration: 0.4 }}
                  style={{ width: '100%' }}
                >
                  <HStack
                    spacing={3}
                    p={4}
                    bg={featureBg}
                    borderRadius="lg"
                    border="1px"
                    borderColor={featureBorderColor}
                    w="100%"
                  >
                    <motion.div variants={iconVariants} whileHover="hover">
                      <Icon
                        as={feature.icon}
                        color="teal.500"
                        boxSize={5}
                      />
                    </motion.div>
                    <Text fontSize="sm" color="gray.700" fontWeight="medium">
                      {feature.text}
                    </Text>
                  </HStack>
                </motion.div>
              ))}
            </VStack>

            <Divider />

            {/* Sign In Options */}
            <VStack spacing={3} w="100%">
              <Text fontSize="sm" color="gray.500" textAlign="center" fontWeight="medium">
                Choose your preferred sign-in method:
              </Text>
              
              <VStack spacing={3} w="100%">
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  style={{ width: '100%' }}
                >
                  <Button
                    onClick={onLogin}
                    colorScheme="red"
                    size="lg"
                    w="100%"
                    leftIcon={<Icon as={FaGoogle} />}
                    borderRadius="lg"
                    fontWeight="semibold"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                  >
                    Continue with Google
                  </Button>
                </motion.div>

                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  style={{ width: '100%' }}
                >
                  <Button
                    onClick={onLogin}
                    colorScheme="blue"
                    size="lg"
                    w="100%"
                    leftIcon={<Icon as={FaMicrosoft} />}
                    borderRadius="lg"
                    fontWeight="semibold"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                  >
                    Continue with Microsoft
                  </Button>
                </motion.div>
              </VStack>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter pt={4} pb={6}>
          <VStack spacing={4} w="100%">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Text fontSize="xs" color="gray.400" textAlign="center" maxW="400px">
                By signing in, you agree to our{' '}
                <Text as="span" color="teal.500" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text as="span" color="teal.500" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                  Privacy Policy
                </Text>
              </Text>
            </motion.div>

            <HStack spacing={4} fontSize="sm" color="gray.500">
              <HStack spacing={1}>
                <Icon as={FaShieldAlt} color="green.500" boxSize={3} />
                <Text>Secure</Text>
              </HStack>
              <Text>•</Text>
              <HStack spacing={1}>
                <Icon as={FaRocket} color="blue.500" boxSize={3} />
                <Text>Fast Setup</Text>
              </HStack>
              <Text>•</Text>
              <Text fontWeight="semibold" color="teal.600">Free Account</Text>
            </HStack>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}