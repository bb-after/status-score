import { useState } from "react";
import { Box, Flex, VStack, HStack, Text, Button } from "@chakra-ui/react";

interface WelcomeBannerProps {
  userName: string;
  onDismiss?: () => void;
  upgradeHref?: string;
}

export function WelcomeBanner({
  userName,
  onDismiss,
  upgradeHref = "/upgrade",
}: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
      return;
    }
    setIsVisible(false);
  };

  if (!isVisible && !onDismiss) return null;

  return (
    <Box
      bgGradient="linear(to-r, teal.600, cyan.500)"
      rounded="xl"
      p={6}
      mb={8}
      mx={6}
      color="white"
      position="relative"
    >
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Text fontSize="xl" fontWeight="bold">
            {`Welcome back, ${userName}!`}
          </Text>
          <Text fontSize="sm" color="teal.100">
            Your reputation analysis results are automatically saved
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            as="a"
            href={upgradeHref}
            bg="white"
            color="teal.700"
            _hover={{ bg: "gray.50" }}
            size="md"
          >
            Upgrade Now
          </Button>
          <Button
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            size="sm"
            onClick={handleDismiss}
          >
            ✕
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}
