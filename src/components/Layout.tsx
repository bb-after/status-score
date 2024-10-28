// components/Layout.tsx
import {
  Box,
  Flex,
  Link,
  Image,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  Text,
  Button,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/auth/me", {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user session", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <Box bg="gray.800" px={4}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Box>
            <Image
              src="https://status-score-public.s3.us-east-2.amazonaws.com/logo-1.png"
              alt="Logo"
              height={8}
            />
          </Box>
          <HStack
            spacing={8}
            alignItems="center"
            display={{ base: "none", md: "flex" }}
          >
            {isLoading ? (
              // Loading state while waiting for the user's data
              <Text color="gray.300">Loading...</Text>
            ) : user ? (
              // Show these links if the user is logged in
              <>
                <Link href="/dashboard" color="gray.300">
                  Dashboard
                </Link>
                <Link href="/add-keyword" color="gray.300">
                  Add Keyword
                </Link>
                <Link href="/keyword-analysis" color="gray.300">
                  Keyword Analysis
                </Link>
                <Link href="/schedule" color="gray.300">
                  Schedule
                </Link>
                <Link
                  href="/admin/data-sources/weight-management"
                  color="gray.300"
                >
                  Weighting
                </Link>
                <Link href="/admin/data-sources" color="gray.300">
                  Data Sources
                </Link>

                <Text color="gray.300">
                  Welcome, {user?.email}
                  &nbsp;
                  <Link href="/api/auth/logout" color="gray.300" fontSize="xs">
                    (Logout)
                  </Link>
                </Text>
              </>
            ) : (
              // Show login button if the user is not logged in
              <Button as="a" href="/api/auth/login" colorScheme="teal">
                Login
              </Button>
            )}
          </HStack>
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as="nav" spacing={4}>
              {isLoading ? (
                <Text color="gray.300">Loading...</Text>
              ) : user ? (
                <>
                  <Text color="gray.300">{user?.email}</Text>
                  <Link href="/dashboard" color="gray.300">
                    Dashboard
                  </Link>
                  <Link href="/add-keyword" color="gray.300">
                    Add Keyword
                  </Link>
                  <Link href="/keyword-analysis" color="gray.300">
                    Keyword Analysis
                  </Link>
                  <Link href="/schedule" color="gray.300">
                    Schedule
                  </Link>
                  <Link
                    href="/admin/data-sources/weight-management"
                    color="gray.300"
                  >
                    Weighting
                  </Link>
                  <Link href="/admin/data-sources" color="gray.300">
                    Data Sources
                  </Link>
                  <Link href="/api/auth/logout" color="gray.300">
                    Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/" color="gray.300">
                    Home
                  </Link>
                  <Button as="a" href="/api/auth/login" colorScheme="teal">
                    Login
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Box>{children}</Box>
    </>
  );
}
