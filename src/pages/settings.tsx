import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  Switch,
  FormControl,
  FormLabel,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Icon,
  Flex,
  Divider,
  Alert,
  AlertIcon,
  useColorModeValue,
} from "@chakra-ui/react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  FaCrown,
  FaUser,
  FaCog,
  FaTrash,
  FaCreditCard,
  FaInfoCircle,
} from "react-icons/fa";
import { useSubscription } from "../hooks/useSubscription";
import { ProtectedRoute } from "../components/ProtectedRoute";

const SettingsPage = () => {
  const { user, isLoading: authLoading } = useUser();
  const { hasActiveSubscription, loading: subscriptionLoading } =
    useSubscription();
  const [receiveEmails, setReceiveEmails] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiveEmails }),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: "Please try again later.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    window.location.href = "/upgrade";
  };

  const handleManageBilling = () => {
    // This would typically redirect to Stripe customer portal
    toast({
      title: "Billing Management",
      description: "Redirecting to billing portal...",
      status: "info",
      duration: 2000,
    });
    // window.location.href = "/api/billing/portal";
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete account");

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
        status: "success",
        duration: 3000,
      });

      // Redirect to logout
      window.location.href = "/api/auth/logout";
    } catch (error) {
      toast({
        title: "Failed to delete account",
        description: "Please try again later.",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <ProtectedRoute
      title="Sign in to access settings"
      description="Please sign in to view and modify your account settings."
      loadingMessage="Loading settings..."
    >
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="4xl">
          {/* Header */}
          <VStack spacing={2} align="start" mb={8}>
            <HStack spacing={3}>
              <Box
                w={12}
                h={12}
                bgGradient="linear(to-r, teal.500, cyan.400)"
                rounded="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FaCog} color="white" boxSize={6} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="xl" color="gray.900">
                  Account Settings
                </Heading>
                <Text color="gray.600">
                  Manage your account preferences and subscription
                </Text>
              </VStack>
            </HStack>
          </VStack>

          <VStack spacing={6} align="stretch">
            {/* Subscription Card */}
            <Card bg={cardBg} shadow="sm" border="1px" borderColor="gray.200">
              <CardHeader pb={3}>
                <HStack justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Icon as={FaCrown} color="gold" boxSize={5} />
                    <Text fontSize="lg" fontWeight="semibold">
                      Subscription Plan
                    </Text>
                  </HStack>
                  <Badge
                    colorScheme={hasActiveSubscription ? "green" : "gray"}
                    variant="subtle"
                    fontSize="sm"
                    px={3}
                    py={1}
                    rounded="full"
                  >
                    {subscriptionLoading ? (
                      <HStack spacing={1}>
                        <Spinner size="xs" />
                        <Text>Loading...</Text>
                      </HStack>
                    ) : hasActiveSubscription ? (
                      "Premium"
                    ) : (
                      "Free"
                    )}
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="stretch" spacing={4}>
                  {hasActiveSubscription ? (
                    <>
                      <Alert status="success" variant="subtle" rounded="lg">
                        <AlertIcon />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">
                            You&apos;re on the Premium plan
                          </Text>
                          <Text fontSize="sm">
                            Enjoy unlimited reputation analyses, GEO checking,
                            score comparisons, and priority support.
                          </Text>
                        </VStack>
                      </Alert>
                      <HStack spacing={3}>
                        <Button
                          leftIcon={<Icon as={FaCreditCard} />}
                          onClick={handleManageBilling}
                          variant="outline"
                          colorScheme="teal"
                        >
                          Manage Billing
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          color="gray.500"
                          onClick={() => {
                            toast({
                              title: "Need help?",
                              description:
                                "Contact support to cancel your subscription.",
                              status: "info",
                              duration: 5000,
                            });
                          }}
                        >
                          Cancel Subscription
                        </Button>
                      </HStack>
                    </>
                  ) : (
                    <>
                      <Alert status="info" variant="subtle" rounded="lg">
                        <AlertIcon />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">
                            You&apos;re on the Free plan
                          </Text>
                          <Text fontSize="sm">
                            Upgrade to Premium for unlimited analyses, GEO
                            checking, score comparisons, and more.
                          </Text>
                        </VStack>
                      </Alert>
                      <Box>
                        <Button
                          leftIcon={<Icon as={FaCrown} />}
                          onClick={handleUpgrade}
                          colorScheme="teal"
                          size="lg"
                          bgGradient="linear(to-r, teal.600, cyan.500)"
                          _hover={{
                            bgGradient: "linear(to-r, teal.700, cyan.600)",
                          }}
                        >
                          Upgrade to Premium - $49/month
                        </Button>
                      </Box>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Profile Settings Card */}
            <Card bg={cardBg} shadow="sm" border="1px" borderColor="gray.200">
              <CardHeader pb={3}>
                <HStack spacing={3}>
                  <Icon as={FaUser} color="teal.500" boxSize={5} />
                  <Text fontSize="lg" fontWeight="semibold">
                    Profile Settings
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Email Address
                    </Text>
                    <Text fontWeight="medium">
                      {user?.email || "Not available"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Name
                    </Text>
                    <Text fontWeight="medium">{user?.name || "Not set"}</Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Preferences Card */}
            <Card bg={cardBg} shadow="sm" border="1px" borderColor="gray.200">
              <CardHeader pb={3}>
                <HStack spacing={3}>
                  <Icon as={FaInfoCircle} color="blue.500" boxSize={5} />
                  <Text fontSize="lg" fontWeight="semibold">
                    Preferences
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="stretch" spacing={4}>
                  <FormControl
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <VStack align="start" spacing={0} flex={1}>
                      <FormLabel
                        htmlFor="email-alerts"
                        mb={0}
                        fontWeight="medium"
                      >
                        Email Notifications
                      </FormLabel>
                      <Text fontSize="sm" color="gray.600">
                        Receive weekly reputation updates and analysis reports
                      </Text>
                    </VStack>
                    <Switch
                      id="email-alerts"
                      isChecked={receiveEmails}
                      onChange={(e) => setReceiveEmails(e.target.checked)}
                      colorScheme="teal"
                      size="lg"
                    />
                  </FormControl>
                  <Divider />
                  <Button
                    onClick={handleSaveSettings}
                    colorScheme="teal"
                    isLoading={isLoading}
                    loadingText="Saving..."
                    alignSelf="start"
                  >
                    Save Preferences
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Danger Zone Card */}
            <Card bg={cardBg} shadow="sm" border="1px" borderColor="red.200">
              <CardHeader pb={3}>
                <HStack spacing={3}>
                  <Icon as={FaTrash} color="red.500" boxSize={5} />
                  <Text fontSize="lg" fontWeight="semibold" color="red.600">
                    Danger Zone
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="stretch" spacing={4}>
                  <Alert status="warning" variant="subtle" rounded="lg">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Deleting your account will permanently remove all your
                      data, including reputation analyses and history.
                    </Text>
                  </Alert>
                  <Button
                    onClick={onDeleteOpen}
                    colorScheme="red"
                    variant="outline"
                    leftIcon={<Icon as={FaTrash} />}
                    alignSelf="start"
                  >
                    Delete Account
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="red.600">Delete Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="error" variant="subtle" rounded="lg">
                <AlertIcon />
                <Text fontSize="sm">
                  This action cannot be undone. This will permanently delete
                  your account and all associated data.
                </Text>
              </Alert>
              <Text>
                Are you sure you want to delete your account? All your
                reputation analyses, history, and settings will be permanently
                removed.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ProtectedRoute>
  );
};

export default SettingsPage;
