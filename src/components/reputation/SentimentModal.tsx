import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  RadioGroup,
  Radio,
  Textarea,
  Box,
  Badge,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { FaThumbsUp, FaThumbsDown, FaEquals } from "react-icons/fa";
import { SearchResult } from "./ReputationDashboard";

interface SentimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SearchResult | null;
  currentSentiment: "positive" | "neutral" | "negative";
  onSave: (newSentiment: "positive" | "neutral" | "negative", reason: string) => Promise<void>;
  existingAnnotation?: {
    sentiment: "positive" | "neutral" | "negative";
    reason: string;
    updatedAt: string;
  };
}

export function SentimentModal({
  isOpen,
  onClose,
  result,
  currentSentiment,
  onSave,
  existingAnnotation,
}: SentimentModalProps) {
  const [selectedSentiment, setSelectedSentiment] = useState<"positive" | "neutral" | "negative">(currentSentiment);
  const [reason, setReason] = useState(existingAnnotation?.reason || "");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for this sentiment adjustment",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(selectedSentiment, reason);
      toast({
        title: "Sentiment Updated",
        description: "Your sentiment adjustment has been saved",
        status: "success",
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save sentiment adjustment. Please try again.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return FaThumbsUp;
      case "negative":
        return FaThumbsDown;
      default:
        return FaEquals;
    }
  };

  if (!result) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="flex-start" spacing={2}>
            <Text>Adjust Sentiment</Text>
            <HStack spacing={2}>
              <Badge colorScheme={getSentimentColor(currentSentiment)} size="sm">
                Current: {currentSentiment}
              </Badge>
              {existingAnnotation && (
                <Badge colorScheme="blue" size="sm">
                  Previously Adjusted
                </Badge>
              )}
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Result Preview */}
            <Box p={3} bg="gray.50" rounded="lg" border="1px" borderColor="gray.200">
              <Text fontSize="sm" fontWeight="semibold" color="blue.600" mb={1}>
                {result.title}
              </Text>
              <Text fontSize="xs" color="gray.500" mb={2}>
                {result.source} • {result.url}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {result.snippet}
              </Text>
            </Box>

            {/* Sentiment Selection */}
            <Box>
              <Text fontWeight="medium" mb={3}>
                How should this result be classified?
              </Text>
              <RadioGroup
                value={selectedSentiment}
                onChange={(value: "positive" | "neutral" | "negative") => setSelectedSentiment(value)}
              >
                <VStack align="stretch" spacing={2}>
                  <Box
                    p={3}
                    border="1px"
                    borderColor={selectedSentiment === "positive" ? "green.300" : "gray.200"}
                    bg={selectedSentiment === "positive" ? "green.50" : "transparent"}
                    rounded="md"
                    cursor="pointer"
                    _hover={{ borderColor: "green.300", bg: "green.50" }}
                    onClick={() => setSelectedSentiment("positive")}
                  >
                    <HStack spacing={3}>
                      <Radio value="positive" colorScheme="green" />
                      <Icon as={FaThumbsUp} color="green.500" />
                      <Text fontWeight={selectedSentiment === "positive" ? "semibold" : "normal"}>
                        Positive - This content is favorable
                      </Text>
                    </HStack>
                  </Box>
                  
                  <Box
                    p={3}
                    border="1px"
                    borderColor={selectedSentiment === "neutral" ? "gray.400" : "gray.200"}
                    bg={selectedSentiment === "neutral" ? "gray.50" : "transparent"}
                    rounded="md"
                    cursor="pointer"
                    _hover={{ borderColor: "gray.400", bg: "gray.50" }}
                    onClick={() => setSelectedSentiment("neutral")}
                  >
                    <HStack spacing={3}>
                      <Radio value="neutral" colorScheme="gray" />
                      <Icon as={FaEquals} color="gray.500" />
                      <Text fontWeight={selectedSentiment === "neutral" ? "semibold" : "normal"}>
                        Neutral - This content is factual/balanced
                      </Text>
                    </HStack>
                  </Box>
                  
                  <Box
                    p={3}
                    border="1px"
                    borderColor={selectedSentiment === "negative" ? "red.300" : "gray.200"}
                    bg={selectedSentiment === "negative" ? "red.50" : "transparent"}
                    rounded="md"
                    cursor="pointer"
                    _hover={{ borderColor: "red.300", bg: "red.50" }}
                    onClick={() => setSelectedSentiment("negative")}
                  >
                    <HStack spacing={3}>
                      <Radio value="negative" colorScheme="red" />
                      <Icon as={FaThumbsDown} color="red.500" />
                      <Text fontWeight={selectedSentiment === "negative" ? "semibold" : "normal"}>
                        Negative - This content is unfavorable
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </RadioGroup>
            </Box>

            {/* Reason */}
            <Box>
              <Text fontWeight="medium" mb={2}>
                Reason for adjustment *
              </Text>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you're changing this sentiment classification..."
                rows={3}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                This will help you remember your reasoning and improve future analysis
              </Text>
            </Box>

            {/* Previous Annotation Info */}
            {existingAnnotation && (
              <Box p={3} bg="blue.50" rounded="lg" border="1px" borderColor="blue.200">
                <Text fontSize="sm" fontWeight="medium" color="blue.700" mb={1}>
                  Previous Adjustment
                </Text>
                <Text fontSize="sm" color="blue.600" mb={1}>
                  Changed to: {existingAnnotation.sentiment}
                </Text>
                <Text fontSize="sm" color="blue.600" mb={1}>
                  Reason: {existingAnnotation.reason}
                </Text>
                <Text fontSize="xs" color="blue.500">
                  Updated: {new Date(existingAnnotation.updatedAt).toLocaleDateString()}
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="teal"
            onClick={handleSave}
            isLoading={isLoading}
            leftIcon={<Icon as={getSentimentIcon(selectedSentiment)} />}
          >
            Save Adjustment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}