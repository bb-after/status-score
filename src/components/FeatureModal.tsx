import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Box,
  Icon,
} from "@chakra-ui/react";
import { FaGlobe, FaChartLine, FaComments } from "react-icons/fa";
import NextLink from "next/link";

const aquamarineColors = {
  4: "#00f8ba",
  300: "#00e5aa",
  500: "#00d299",
  700: "#00bf88",
};

const getFeatureIcon = (title) => {
  switch (title) {
    case "Multi-Platform Monitoring":
      return FaGlobe;
    case "Sentiment Analysis":
      return FaComments;
    case "Trend Visualization":
      return FaChartLine;
    default:
      return FaGlobe;
  }
};

const FeatureModal = ({ isOpen, onClose, feature }) => {
  if (!feature) return null;

  const FeatureIcon = getFeatureIcon(feature.title);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader fontSize="2xl" fontWeight="bold" textAlign="center">
          {feature.title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Icon
                as={FeatureIcon}
                w={20}
                h={20}
                color={aquamarineColors[4]}
              />
            </Box>
            <Text fontSize="md" lineHeight="1.6">
              {feature.modalContent}
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button
            as={NextLink}
            href="/"
            size="lg"
            bg={aquamarineColors[4]}
            color="gray.900"
            _hover={{ bg: aquamarineColors[300] }}
            onClick={onClose}
          >
            Get Started
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FeatureModal;
