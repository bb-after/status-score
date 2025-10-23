import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Progress,
  Card,
  CardBody,
  Flex,
  Icon,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import {
  FiShield,
  FiFileText,
  FiUser,
  FiUsers,
  FiShare2,
  FiBook,
  FiCpu,
  FiAward,
  FiBell,
  FiTarget,
  FiPhone,
} from "react-icons/fi";
import { ReputationData } from "./ReputationDashboard";

interface ActionItem {
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  icon: any;
  cta: string;
  impact: string;
  details?: string;
  action: "link-suppression-modal" | "contact-modal";
  actionType: string;
}

interface ReputationActionItemsProps {
  score: number;
  type: "individual" | "company" | "public-figure";
  data: ReputationData;
}

// Simple Contact Modal for now - you can replace with your existing ContactModal
const ContactModal = ({
  isOpen,
  onClose,
  actionType,
}: {
  isOpen: boolean;
  onClose: () => void;
  actionType: string;
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="lg">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Contact Sales - {actionType}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text>
          Thank you for your interest in our {actionType} services. Our team
          will contact you shortly to discuss your reputation management needs.
        </Text>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="blue" mr={3} onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

// Simple Link Suppression Modal for now
const LinkSuppressionModal = ({
  isOpen,
  onClose,
  actionType,
}: {
  isOpen: boolean;
  onClose: () => void;
  actionType: string;
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="lg">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Link Suppression Campaign - {actionType}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text>
          Our link suppression campaign will help remove or suppress negative
          content affecting your reputation. Our team will analyze your
          situation and provide a custom strategy.
        </Text>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="blue" mr={3} onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export function ReputationActionItems({
  score,
  type,
  data,
}: ReputationActionItemsProps) {
  const [selectedAction, setSelectedAction] = useState<string>("");
  const {
    isOpen: isContactModalOpen,
    onOpen: onContactModalOpen,
    onClose: onContactModalClose,
  } = useDisclosure();
  const {
    isOpen: isLinkSuppressionModalOpen,
    onOpen: onLinkSuppressionModalOpen,
    onClose: onLinkSuppressionModalClose,
  } = useDisclosure();

  const bgGradient = useColorModeValue(
    "linear(to-r, red.50, orange.50)",
    "linear(to-r, red.900, orange.900)",
  );
  const borderColor = useColorModeValue("red.200", "red.600");

  const getActionItems = (
    score: number,
    type: string,
    data: ReputationData,
  ): ActionItem[] => {
    const items: ActionItem[] = [];

    // 1. If there is at least 1 negative link, include link suppression
    if (data.negativeLinks >= 1) {
      items.push({
        priority: "high",
        title:
          type === "public-figure"
            ? "Crisis PR Management"
            : "Immediate Negative Content Suppression",
        description:
          type === "public-figure"
            ? "Deploy comprehensive crisis management strategy for public figure reputation recovery."
            : "Remove or suppress damaging search results that are significantly impacting your reputation.",
        icon: FiShield,
        cta:
          type === "public-figure"
            ? "Start Crisis PR"
            : "Start Link Suppression Campaign",
        impact: "+15-25 points",
        action: "link-suppression-modal",
        actionType: "crisis-management",
      });
    }

    // 2. Always show content creation campaign
    items.push({
      priority: "high",
      title:
        type === "public-figure"
          ? "Media Relations Campaign"
          : "Content Creation Campaign",
      description:
        type === "public-figure"
          ? "Launch strategic media outreach and positive press coverage campaign."
          : "Develop high-quality positive content to improve search result rankings.",
      icon: FiFileText,
      cta:
        type === "public-figure"
          ? "Launch Media Strategy"
          : "Launch Content Strategy",
      impact: "+8-15 points",
      action: "contact-modal",
      actionType: "content-strategy",
    });

    // 3. GEO optimization when score < 70
    if (score < 70) {
      items.push({
        priority: "high",
        title: "Generative Engine Optimization (GEO)",
        description:
          "Optimize your content for AI/LLM recognition. When AI Overviews and People Also Ask don't show positive information, GEO ensures LLMs like ChatGPT, Claude, and Gemini surface favorable content about you.",
        icon: FiCpu,
        cta: "Start GEO Campaign",
        impact: "+8-15 points",
        details:
          "Critical as AI becomes the primary information source for decision-makers",
        action: "contact-modal",
        actionType: "geo-optimization",
      });

      items.push({
        priority: "medium",
        title:
          type === "individual"
            ? "Personal Brand Building"
            : "Wikipedia Page Enhancement",
        description:
          type === "individual"
            ? "Build your personal brand through professional profiles and content creation."
            : type === "public-figure"
              ? "Optimize Wikipedia presence - critical for public figure credibility. Consider notability check if no page exists."
              : "Create or improve your Wikipedia presence to boost credibility.",
        icon: type === "individual" ? FiUser : FiBook,
        cta:
          type === "individual" ? "Build Personal Brand" : "Enhance Wikipedia",
        impact: type === "individual" ? "+3-6 points" : "+8-12 points",
        action: "contact-modal",
        actionType:
          type === "individual" ? "personal-brand" : "wikipedia-enhancement",
      });

      items.push({
        priority: "medium",
        title:
          type === "company"
            ? "Brand Social Strategy"
            : "Social Media Optimization",
        description:
          type === "company"
            ? "Strengthen brand presence across social platforms and review sites."
            : "Strengthen your social media presence across key platforms.",
        icon: FiShare2,
        cta:
          type === "company"
            ? "Optimize Brand Presence"
            : "Optimize Social Presence",
        impact: "+2-5 points",
        action: "contact-modal",
        actionType: "social-optimization",
      });
    }

    // 4. Show personal/company brand building if < 2 owned assets
    if (data.ownedAssets < 2) {
      items.push({
        priority: "medium",
        title:
          type === "company"
            ? "Brand Asset Development"
            : "Personal Brand Building",
        description:
          type === "company"
            ? "Create and optimize owned digital assets including company website, profiles, and branded content."
            : "Build personal brand through professional website, social profiles, and thought leadership content.",
        icon: type === "company" ? FiUsers : FiUser,
        cta: type === "company" ? "Build Brand Assets" : "Build Personal Brand",
        impact: "+5-12 points",
        details: "Owned assets give you control over your online narrative",
        action: "contact-modal",
        actionType: "brand-building",
      });
    }

    // 5. Show social media optimization if < 2 owned assets (additional social focus)
    if (data.ownedAssets < 2) {
      items.push({
        priority: "medium",
        title: "Social Media Asset Creation",
        description:
          "Establish professional presence on key social platforms to create owned assets that rank in search results.",
        icon: FiShare2,
        cta: "Create Social Assets",
        impact: "+3-8 points",
        details: "Social profiles often rank high in personal/brand searches",
        action: "contact-modal",
        actionType: "social-asset-creation",
      });
    }

    return items;
  };

  const actionItems = getActionItems(score, type, data);

  if (actionItems.length === 0) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      default:
        return "blue";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return FiBell;
      case "medium":
        return FiTarget;
      default:
        return FiBell;
    }
  };

  const getScoreRange = (score: number) => {
    if (score < 50) return "Poor";
    if (score < 60) return "Fair";
    if (score < 70) return "Good";
    if (score < 80) return "Great";
    return "Excellent";
  };

  const getNextLevel = (score: number) => {
    if (score < 50) return { level: "Fair", target: 50 };
    if (score < 60) return { level: "Good", target: 60 };
    if (score < 70) return { level: "Great", target: 70 };
    if (score < 80) return { level: "Excellent", target: 80 };
    return { level: "Perfect", target: 100 };
  };

  const nextLevel = getNextLevel(score);
  const pointsNeeded = nextLevel.target - score;

  return (
    <>
      <Box
        bgGradient={bgGradient}
        borderRadius="xl"
        border="1px"
        borderColor={borderColor}
        p={6}
        mb={6}
      >
        <Flex align="center" mb={6}>
          <Box
            w={10}
            h={10}
            bg="red.100"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mr={3}
          >
            <Icon as={FiTarget} color="red.600" boxSize={5} />
          </Box>
          <Box>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              Path to {nextLevel.level} Reputation
            </Text>
            <Text fontSize="sm" color="gray.600">
              Current: {getScoreRange(score)} ({score}/100) • Need{" "}
              {pointsNeeded} more points to reach {nextLevel.level}
            </Text>
          </Box>
        </Flex>

        {/* Score Progression */}
        <Box
          mb={6}
          p={4}
          bg="white"
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
        >
          <Box position="relative" mb={4}>
            <Progress
              value={score}
              colorScheme={
                score < 50
                  ? "red"
                  : score < 60
                    ? "orange"
                    : score < 70
                      ? "yellow"
                      : "green"
              }
              size="lg"
              borderRadius="full"
              mb={2}
            />

            {/* Hashmark indicators */}
            <Box position="relative" mb={3}>
              <Box position="absolute" left="0%" w="1px" h="4" bg="gray.300" />
              <Box
                position="absolute"
                left="50%"
                w="1px"
                h="4"
                bg="gray.300"
                transform="translateX(-0.5px)"
              />
              <Box
                position="absolute"
                left="60%"
                w="1px"
                h="4"
                bg="gray.300"
                transform="translateX(-0.5px)"
              />
              <Box
                position="absolute"
                left="70%"
                w="1px"
                h="4"
                bg="gray.300"
                transform="translateX(-0.5px)"
              />
              <Box
                position="absolute"
                left="80%"
                w="1px"
                h="4"
                bg="gray.300"
                transform="translateX(-0.5px)"
              />
              <Box position="absolute" right="0%" w="1px" h="4" bg="gray.300" />
            </Box>

            {/* Score labels below the bar */}
            <Flex justify="space-between" fontSize="xs" color="gray.500">
              <Box textAlign="left">
                <Text>Poor</Text>
                <Text color="gray.400">(0-49)</Text>
              </Box>
              <Box textAlign="center">
                <Text>Fair</Text>
                <Text color="gray.400">(50-59)</Text>
              </Box>
              <Box textAlign="center">
                <Text>Good</Text>
                <Text color="gray.400">(60-69)</Text>
              </Box>
              <Box textAlign="center">
                <Text>Great</Text>
                <Text color="gray.400">(70-79)</Text>
              </Box>
              <Box textAlign="right">
                <Text>Excellent</Text>
                <Text color="gray.400">(80+)</Text>
              </Box>
            </Flex>
          </Box>

          <Text
            textAlign="center"
            fontSize="sm"
            fontWeight="medium"
            color="gray.700"
          >
            {pointsNeeded} points to {nextLevel.level}
          </Text>
        </Box>

        <VStack spacing={4} align="stretch">
          {actionItems.map((item, index) => (
            <Card key={index} variant="outline" bg="white">
              <CardBody>
                <Flex justify="space-between" align="flex-start">
                  <Flex align="flex-start">
                    <Box
                      w={8}
                      h={8}
                      bg="gray.100"
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mr={3}
                    >
                      <Icon as={item.icon} color="gray.600" boxSize={4} />
                    </Box>
                    <Box flex="1">
                      <Flex align="center" mb={1} flexWrap="wrap" gap={2}>
                        <Text fontWeight="medium" color="gray.900">
                          {item.title}
                        </Text>
                        <Badge
                          colorScheme={getPriorityColor(item.priority)}
                          variant="subtle"
                          fontSize="xs"
                        >
                          <Icon
                            as={getPriorityIcon(item.priority)}
                            boxSize={3}
                            mr={1}
                          />
                          {item.priority.toUpperCase()}
                        </Badge>
                        {item.impact && (
                          <Badge
                            colorScheme="green"
                            variant="subtle"
                            fontSize="xs"
                          >
                            {item.impact}
                          </Badge>
                        )}
                      </Flex>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        {item.description}
                      </Text>
                      {item.details && (
                        <Text
                          fontSize="xs"
                          color="blue.600"
                          bg="blue.50"
                          px={2}
                          py={1}
                          borderRadius="sm"
                        >
                          <Icon as={FiBell} boxSize={3} mr={1} />
                          {item.details}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    ml={4}
                    flexShrink={0}
                    onClick={() => {
                      if (item.action === "link-suppression-modal") {
                        setSelectedAction(item.actionType);
                        onLinkSuppressionModalOpen();
                      } else if (item.action === "contact-modal") {
                        setSelectedAction(item.actionType);
                        onContactModalOpen();
                      }
                    }}
                  >
                    {item.cta}
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>

        {/* Strategy Call CTA */}
        <Box mt={6} pt={6} borderTop="1px" borderColor="red.200">
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontWeight="medium" color="gray.900">
                Ready to Reach {nextLevel.level} Status?
              </Text>
              <Text fontSize="sm" color="gray.600">
                Our specialists can help you implement a strategic plan to gain
                those {pointsNeeded} points.
              </Text>
            </Box>
            <Button
              bgGradient="linear(to-r, blue.600, purple.600)"
              color="white"
              _hover={{
                bgGradient: "linear(to-r, blue.700, purple.700)",
              }}
              leftIcon={<Icon as={FiPhone} />}
              flexShrink={0}
              ml={4}
              onClick={() => {
                setSelectedAction("strategy-consultation");
                onContactModalOpen();
              }}
            >
              Schedule Strategy Call
            </Button>
          </Flex>
        </Box>
      </Box>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={onContactModalClose}
        actionType={selectedAction}
      />

      <LinkSuppressionModal
        isOpen={isLinkSuppressionModalOpen}
        onClose={onLinkSuppressionModalClose}
        actionType={selectedAction}
      />
    </>
  );
}
