import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
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
} from "@chakra-ui/react";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import axios from "axios";

const SettingsPage = () => {
  const [receiveEmails, setReceiveEmails] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await axios.put("/api/user/settings", { receiveEmails });
      toast({
        title: "Settings saved.",
        description: "Your settings have been successfully updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Unable to save your settings. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        await axios.delete("/api/user/account");
        toast({
          title: "Account deleted.",
          description: "Your account has been successfully deleted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        router.push("/");
      } catch (error) {
        toast({
          title: "An error occurred.",
          description: "Unable to delete your account. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Layout>
      <Container maxW="container.md" py={8}>
        <Heading mb={6}>Settings</Heading>
        <VStack spacing={6} align="stretch">
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="email-alerts" mb="0">
              Receive email notifications
            </FormLabel>
            <Switch
              id="email-alerts"
              isChecked={receiveEmails}
              onChange={(e) => setReceiveEmails(e.target.checked)}
            />
          </FormControl>
          <Button
            onClick={handleSaveSettings}
            colorScheme="teal"
            isLoading={isLoading}
          >
            Save Settings
          </Button>
          <Button onClick={onOpen} colorScheme="blue">
            Update Billing
          </Button>
          <Button onClick={handleDeleteAccount} colorScheme="red">
            Delete Account
          </Button>
        </VStack>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Billing Update</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Billing update feature is coming soon. Stay tuned!</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
};

export default SettingsPage;
