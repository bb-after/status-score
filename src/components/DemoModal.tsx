import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  Progress,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Container,
  keyframes,
} from '@chakra-ui/react';
import { CloseIcon, InfoIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Custom progress bar pulse animation
const progressPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(56, 178, 172, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(56, 178, 172, 0); }
  100% { box-shadow: 0 0 0 0 rgba(56, 178, 172, 0); }
`;

// Framer Motion variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  })
};

const textVariants = {
  enter: { y: 20, opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 }
};

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(0);

  const demoSteps = useMemo(() => [
    {
      title: "Search & Analysis",
      description: "Enter any name or company to get instant reputation analysis",
      image: "https://readdy.ai/api/search-image?query=Modern%20dashboard%20interface%20showing%20search%20bar%20with%20keyword%20input%20and%20analysis%20button%2C%20clean%20white%20background%20with%20teal%20accent%20colors%20and%20professional%20typography&width=600&height=400&seq=demo-search&orientation=landscape",
      duration: 4000
    },
    {
      title: "Comprehensive Scoring",
      description: "Get a detailed score breakdown across 6 key reputation factors",
      image: "https://readdy.ai/api/search-image?query=Professional%20analytics%20dashboard%20showing%20circular%20score%20meter%20at%2072%20points%20with%20colorful%20factor%20breakdown%20charts%20and%20sliders%20for%20positive%20articles%20negative%20links%20and%20social%20presence&width=600&height=400&seq=demo-scoring&orientation=landscape",
      duration: 5000
    },
    {
      title: "Search Results Analysis",
      description: "See exactly what appears when people search for you online",
      image: "https://readdy.ai/api/search-image?query=Google%20search%20results%20page%20mockup%20showing%20mix%20of%20positive%20and%20negative%20search%20results%20with%20sentiment%20indicators%20and%20ranking%20positions%20highlighted%20in%20clean%20modern%20interface&width=600&height=400&seq=demo-results&orientation=landscape",
      duration: 4000
    },
    {
      title: "Historical Tracking",
      description: "Monitor your reputation score changes over time with detailed charts",
      image: "https://readdy.ai/api/search-image?query=Line%20chart%20showing%20reputation%20score%20trending%20upward%20over%20time%20with%20data%20points%20and%20grid%20lines%2C%20professional%20dashboard%20style%20with%20teal%20and%20blue%20color%20scheme&width=600&height=400&seq=demo-history&orientation=landscape",
      duration: 4000
    },
    {
      title: "Actionable Insights",
      description: "Get specific recommendations to improve your online reputation",
      image: "https://readdy.ai/api/search-image?query=Action%20items%20checklist%20interface%20showing%20reputation%20improvement%20recommendations%20with%20icons%20for%20content%20creation%20social%20media%20optimization%20and%20negative%20link%20suppression&width=600&height=400&seq=demo-actions&orientation=landscape",
      duration: 4000
    }
  ], []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        setProgress(prev => {
          const increment = 100 / (demoSteps[currentStep].duration / 50); // Smoother updates (50ms intervals)
          const newProgress = prev + increment;
          
          if (newProgress >= 100) {
            if (currentStep < demoSteps.length - 1) {
              setDirection(1);
              setCurrentStep(prev => prev + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          
          return newProgress;
        });
      }, 50); // More frequent updates for smoother animation
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, isOpen, demoSteps]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (currentStep === demoSteps.length - 1 && progress === 100) {
      setCurrentStep(0);
      setProgress(0);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStepClick = (stepIndex: number) => {
    setDirection(stepIndex > currentStep ? 1 : -1);
    setCurrentStep(stepIndex);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleTryDashboard = () => {
    onClose();
    router.push('/reputation');
  };

  if (!isOpen) return null;

  const currentStepData = demoSteps[currentStep];
  const totalProgress = (currentStep * 100 + progress) / demoSteps.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent maxH="90vh" overflow="hidden">
        <ModalHeader>
          <VStack align="flex-start" spacing={1}>
            <Heading size="lg" color="gray.900">Platform Demo</Heading>
            <Text color="gray.600" fontSize="sm">See how our reputation analysis works</Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={6}>
          {/* Progress Bar */}
          <VStack spacing={4} mb={6}>
            <Flex justify="space-between" align="center" w="100%">
              <motion.div
                key={currentStep}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Step {currentStep + 1} of {demoSteps.length}
                </Text>
              </motion.div>
            </Flex>
            <Box w="100%" position="relative">
              <Progress
                value={totalProgress}
                size="md"
                colorScheme="teal"
                w="100%"
                bg="gray.200"
                borderRadius="full"
                sx={{
                  '& > div': {
                    background: isPlaying 
                      ? 'linear-gradient(90deg, #38B2AC, #4FD1C7, #81E6D9)'
                      : 'linear-gradient(90deg, #38B2AC, #4FD1C7)',
                    animation: isPlaying ? `${progressPulse} 2s infinite` : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }}
              />
              {isPlaying && (
                <Box
                  position="absolute"
                  top="50%"
                  left={`${totalProgress}%`}
                  transform="translate(-50%, -50%)"
                  w="4px"
                  h="4px"
                  bg="white"
                  borderRadius="full"
                  boxShadow="0 0 8px rgba(255,255,255,0.8)"
                />
              )}
            </Box>
          </VStack>

          {/* Main Demo Area */}
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} mb={8}>
            {/* Demo Image */}
            <GridItem order={{ base: 2, lg: 1 }}>
              <Box bg="gray.100" borderRadius="xl" overflow="hidden" aspectRatio="3/2" position="relative">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.4 },
                      scale: { duration: 0.4 }
                    }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Image
                      src={currentStepData.image}
                      alt={currentStepData.title}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </Box>
            </GridItem>

            {/* Demo Description */}
            <GridItem order={{ base: 1, lg: 2 }} display="flex" flexDirection="column" justifyContent="center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={textVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut"
                  }}
                >
                  <VStack align="flex-start" spacing={6}>
                    <Heading as="h4" size="lg" color="gray.900">
                      {currentStepData.title}
                    </Heading>
                    <Text fontSize="lg" color="gray.600" lineHeight="relaxed">
                      {currentStepData.description}
                    </Text>

                    {/* Controls */}
                    <HStack spacing={4}>
                      {!isPlaying ? (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={handlePlay}
                            colorScheme="teal"
                            size="lg"
                            leftIcon={<span>▶️</span>}
                          >
                            {currentStep === 0 && progress === 0 ? 'Start Demo' : 'Continue'}
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={handlePause}
                            colorScheme="gray"
                            size="lg"
                            leftIcon={<span>⏸️</span>}
                          >
                            Pause
                          </Button>
                        </motion.div>
                      )}

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleRestart}
                          variant="outline"
                          size="lg"
                          leftIcon={<span>🔄</span>}
                        >
                          Restart
                        </Button>
                      </motion.div>
                    </HStack>
                  </VStack>
                </motion.div>
              </AnimatePresence>
            </GridItem>
          </Grid>

          {/* Step Navigation */}
          <Box pt={6} borderTop="1px" borderColor="gray.200">
            <VStack spacing={4}>
              {/* Dot Navigation */}
              <HStack spacing={2}>
                {demoSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      onClick={() => handleStepClick(index)}
                      size="xs"
                      variant="unstyled"
                      w="12px"
                      h="12px"
                      borderRadius="full"
                      bg={
                        index === currentStep
                          ? 'teal.600'
                          : index < currentStep
                          ? 'teal.300'
                          : 'gray.300'
                      }
                      _hover={{
                        bg: index === currentStep ? 'teal.600' : 'teal.400'
                      }}
                      transform={index === currentStep ? 'scale(1.25)' : 'scale(1)'}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      title={step.title}
                      boxShadow={index === currentStep ? '0 0 12px rgba(56, 178, 172, 0.5)' : 'none'}
                    />
                  </motion.div>
                ))}
              </HStack>
              
              {/* Step Labels */}
              <Flex wrap="wrap" justify="center" gap={2}>
                {demoSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      onClick={() => handleStepClick(index)}
                      size="xs"
                      variant={index === currentStep ? 'solid' : 'outline'}
                      colorScheme={index === currentStep ? 'teal' : 'gray'}
                      fontSize="xs"
                      transition="all 0.2s"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: index === currentStep ? 'lg' : 'md'
                      }}
                    >
                      {step.title}
                    </Button>
                  </motion.div>
                ))}
              </Flex>
            </VStack>
          </Box>
        </ModalBody>

        <ModalFooter bg="gray.50" borderTop="1px" borderColor="gray.200">
          <Flex justify="space-between" align="center" w="100%">
            <HStack spacing={1} color="gray.600" fontSize="sm">
              <InfoIcon />
              <Text>This demo shows the key features of our reputation analysis platform</Text>
            </HStack>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose} size="sm">
                Close Demo
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleTryDashboard}
                size="sm"
                leftIcon={<span>📊</span>}
              >
                Try Live Dashboard
              </Button>
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}