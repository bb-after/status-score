import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
  Avatar,
  Flex,
  Text,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/router";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const ProfilePage = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const toast = useToast();
  const router = useRouter();

  const bgColor = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBgColor = useColorModeValue("gray.100", "gray.600");

  useEffect(() => {
    if (user) {
      // Check for user instead of isAuthenticated
      setName(user.name || "");
      setAvatarPreview(user.picture || "");
    }
  }, [user]); // Only depend on user

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData();
    formData.append("name", name);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      await axios.put("/api/user/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast({
        title: "Profile updated.",
        description: "Your profile has been successfully updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "An error occurred.",
        description: "Unable to update your profile. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text>Loading...</Text>
        </VStack>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} textAlign="center">
          <Heading>Sign in to access your profile</Heading>
          <Text color="gray.600">
            Please sign in to view and edit your profile information.
          </Text>
          <Button as="a" href="/api/auth/login" colorScheme="teal" size="lg">
            Sign In
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Edit Profile</Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Avatar</FormLabel>
              <Flex direction="column" align="center">
                <Avatar
                  size="2xl"
                  name={name}
                  src={avatarPreview}
                  referrerPolicy="no-referrer"
                  mb={4}
                />
                <Box
                  {...getRootProps()}
                  p={6}
                  borderWidth={2}
                  borderStyle="dashed"
                  borderColor={borderColor}
                  borderRadius="md"
                  bg={bgColor}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: hoverBgColor }}
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <Text textAlign="center">Drop the image here</Text>
                  ) : (
                    <Text textAlign="center">
                      Drag and drop an image here, or click to select a file
                    </Text>
                  )}
                </Box>
              </Flex>
            </FormControl>
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={isUpdating}
              loadingText="Updating"
            >
              Update Profile
            </Button>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
};

export default ProfilePage;
