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
  Text,
  Heading,
  List,
  ListItem,
  ListIcon,
  HStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { CheckIcon, StarIcon, LockIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description: string;
}

const premiumFeatures = [
  "Automatic weekly reputation updates",
  "GEO reputation checking",
  "Score comparison tools",
  "Priority customer support",
  "Advanced analytics & insights",
];

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  feature,
  description,
}) => {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/upgrade");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent>
        <ModalHeader textAlign="center" pb={2}>
          <VStack spacing={3}>
            <HStack>
              <Icon as={LockIcon} color="orange.500" boxSize={6} />
              <Badge colorScheme="orange" px={3} py={1} rounded="full">
                Premium Feature
              </Badge>
            </HStack>
            <Heading size="lg" color="gray.900">
              Unlock {feature}
            </Heading>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Text textAlign="center" color="gray.600" fontSize="lg">
              {description}
            </Text>

            <VStack
              p={4}
              bg="teal.50"
              rounded="lg"
              border="1px"
              borderColor="teal.200"
              spacing={3}
              align="stretch"
            >
              <HStack justify="center">
                <Icon as={StarIcon} color="teal.500" />
                <Text fontWeight="semibold" color="teal.700">
                  Premium Plan Benefits
                </Text>
                <Icon as={StarIcon} color="teal.500" />
              </HStack>

              <List spacing={2}>
                {premiumFeatures.map((benefit, index) => (
                  <ListItem key={index}>
                    <ListIcon as={CheckIcon} color="teal.500" />
                    <Text as="span" fontSize="sm">
                      {benefit}
                    </Text>
                  </ListItem>
                ))}
              </List>
            </VStack>

            <VStack spacing={2} textAlign="center">
              <HStack align="baseline" justify="center">
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  $49
                </Text>
                <Text color="gray.500">/month</Text>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Cancel anytime • 7-day money-back guarantee
              </Text>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <VStack w="full" spacing={3}>
            <Button
              colorScheme="teal"
              size="lg"
              onClick={handleUpgrade}
              w="full"
            >
              Upgrade to Premium
            </Button>
            <Button variant="ghost" onClick={onClose} size="sm">
              Maybe Later
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
