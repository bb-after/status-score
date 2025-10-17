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
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { FaCheck, FaTimes, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaPinterest, FaMedium } from "react-icons/fa";
import { SearchResult } from "./ReputationDashboard";

interface AssetClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SearchResult | null;
  onSave: (claimType: "owned" | "not_owned" | "not_relevant", reason: string) => Promise<void>;
  existingClaim?: {
    claimType: "owned" | "not_owned" | "not_relevant";
    reason: string;
    updatedAt: string;
  };
}

export function AssetClaimModal({
  isOpen,
  onClose,
  result,
  onSave,
  existingClaim,
}: AssetClaimModalProps) {
  const [selectedClaim, setSelectedClaim] = useState<"owned" | "not_owned" | "not_relevant">(
    existingClaim?.claimType || "owned"
  );
  const [reason, setReason] = useState(existingClaim?.reason || "");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    // Reason is now optional - we can save with an empty reason
    const finalReason = reason.trim() || `Asset claimed as: ${selectedClaim.replace('_', ' ')}`;

    setIsLoading(true);
    try {
      await onSave(selectedClaim, finalReason);
      toast({
        title: "Asset Claim Updated",
        description: "Your asset ownership claim has been saved",
        status: "success",
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save asset claim. Please try again.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSocialIcon = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('facebook.com')) return FaFacebook;
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return FaTwitter;
    if (lowerUrl.includes('linkedin.com')) return FaLinkedin;
    if (lowerUrl.includes('instagram.com')) return FaInstagram;
    if (lowerUrl.includes('pinterest.com')) return FaPinterest;
    if (lowerUrl.includes('medium.com')) return FaMedium;
    return FaCheck;
  };

  const getSocialPlatform = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('facebook.com')) return 'Facebook';
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'X (Twitter)';
    if (lowerUrl.includes('linkedin.com')) return 'LinkedIn';
    if (lowerUrl.includes('instagram.com')) return 'Instagram';
    if (lowerUrl.includes('pinterest.com')) return 'Pinterest';
    if (lowerUrl.includes('medium.com')) return 'Medium';
    return 'Social Media';
  };

  const getClaimColor = (claimType: string) => {
    switch (claimType) {
      case "owned":
        return "green";
      case "not_owned":
        return "red";
      case "not_relevant":
        return "gray";
      default:
        return "gray";
    }
  };

  if (!result) return null;

  const platform = getSocialPlatform(result.url);
  const SocialIcon = getSocialIcon(result.url);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="flex-start" spacing={2}>
            <HStack spacing={2}>
              <Icon as={SocialIcon} boxSize={5} />
              <Text>Claim {platform} Asset</Text>
            </HStack>
            {existingClaim && (
              <Badge colorScheme={getClaimColor(existingClaim.claimType)} size="sm">
                Previously Claimed: {existingClaim.claimType.replace('_', ' ')}
              </Badge>
            )}
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Result Preview */}
            <Box p={3} bg="gray.50" rounded="lg" border="1px" borderColor="gray.200">
              <HStack spacing={2} mb={2}>
                <Icon as={SocialIcon} boxSize={4} />
                <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                  {result.title}
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500" mb={2}>
                {result.url}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {result.snippet}
              </Text>
            </Box>

            {/* Info Alert */}
            <Alert status="info" size="sm">
              <AlertIcon />
              <Text fontSize="sm">
                Claiming ownership helps us better understand your digital presence and improve your reputation score accuracy.
              </Text>
            </Alert>

            {/* Asset Claim Selection */}
            <Box>
              <Text fontWeight="medium" mb={3}>
                Do you own or control this {platform} profile/page?
              </Text>
              <RadioGroup
                value={selectedClaim}
                onChange={(value: "owned" | "not_owned" | "not_relevant") => setSelectedClaim(value)}
              >
                <VStack align="stretch" spacing={2}>
                  <Box
                    p={3}
                    border="1px"
                    borderColor={selectedClaim === "owned" ? "green.300" : "gray.200"}
                    bg={selectedClaim === "owned" ? "green.50" : "transparent"}
                    rounded="md"
                    cursor="pointer"
                    _hover={{ borderColor: "green.300", bg: "green.50" }}
                    onClick={() => setSelectedClaim("owned")}
                  >
                    <HStack spacing={3}>
                      <Radio value="owned" colorScheme="green" />
                      <Icon as={FaCheck} color="green.500" />
                      <Text fontWeight={selectedClaim === "owned" ? "semibold" : "normal"}>
                        Yes, I own/control this profile
                      </Text>
                    </HStack>
                  </Box>
                  
                  <Box
                    p={3}
                    border="1px"
                    borderColor={selectedClaim === "not_owned" ? "red.300" : "gray.200"}
                    bg={selectedClaim === "not_owned" ? "red.50" : "transparent"}
                    rounded="md"
                    cursor="pointer"
                    _hover={{ borderColor: "red.300", bg: "red.50" }}
                    onClick={() => setSelectedClaim("not_owned")}
                  >
                    <HStack spacing={3}>
                      <Radio value="not_owned" colorScheme="red" />
                      <Icon as={FaTimes} color="red.500" />
                      <Text fontWeight={selectedClaim === "not_owned" ? "semibold" : "normal"}>
                        No, this is not my profile
                      </Text>
                    </HStack>
                  </Box>
                  
                  <Box
                    p={3}
                    border="1px"
                    borderColor={selectedClaim === "not_relevant" ? "gray.400" : "gray.200"}
                    bg={selectedClaim === "not_relevant" ? "gray.50" : "transparent"}
                    rounded="md"
                    cursor="pointer"
                    _hover={{ borderColor: "gray.400", bg: "gray.50" }}
                    onClick={() => setSelectedClaim("not_relevant")}
                  >
                    <HStack spacing={3}>
                      <Radio value="not_relevant" colorScheme="gray" />
                      <Icon as={FaTimes} color="gray.500" />
                      <Text fontWeight={selectedClaim === "not_relevant" ? "semibold" : "normal"}>
                        Not relevant (different person/company)
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </RadioGroup>
            </Box>

            {/* Reason */}
            <Box>
              <Text fontWeight="medium" mb={2}>
                Additional details (optional)
              </Text>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  selectedClaim === "owned"
                    ? "Describe your role or how you control this profile..."
                    : selectedClaim === "not_owned"
                    ? "Explain why this isn't your profile (e.g., different person with same name)..."
                    : "Explain why this result isn't relevant to your reputation..."
                }
                rows={3}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                This information helps us improve your reputation analysis accuracy
              </Text>
            </Box>

            {/* Previous Claim Info */}
            {existingClaim && (
              <Box p={3} bg="blue.50" rounded="lg" border="1px" borderColor="blue.200">
                <Text fontSize="sm" fontWeight="medium" color="blue.700" mb={1}>
                  Previous Claim
                </Text>
                <Text fontSize="sm" color="blue.600" mb={1}>
                  Claimed as: {existingClaim.claimType.replace('_', ' ')}
                </Text>
                <Text fontSize="sm" color="blue.600" mb={1}>
                  Details: {existingClaim.reason}
                </Text>
                <Text fontSize="xs" color="blue.500">
                  Updated: {new Date(existingClaim.updatedAt).toLocaleDateString()}
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
            colorScheme={getClaimColor(selectedClaim)}
            onClick={handleSave}
            isLoading={isLoading}
            leftIcon={<Icon as={selectedClaim === "owned" ? FaCheck : FaTimes} />}
          >
            Save Claim
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}