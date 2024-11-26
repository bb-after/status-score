"use client";

import {
  Box,
  Flex,
  Link as ChakraLink,
  Image,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  Text,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const pathname = usePathname();
  const isHomePage = pathname === "/";

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

  const renderNavLinks = () => {
    if (isLoading) {
      return <Text color="gray.300">Loading...</Text>;
    }

    if (!user) {
      return (
        <Button as="a" href="/api/auth/login" variant="solid">
          Login
        </Button>
      );
    }

    if (isHomePage) {
      return (
        <Text color="gray.300">
          Welcome, {user.email}{" "}
          <ChakraLink
            href="/api/auth/logout"
            color="accent.neon"
            fontSize="xs"
            _hover={{ textDecoration: "underline" }}
          >
            (Logout)
          </ChakraLink>
        </Text>
      );
    }

    return (
      <>
        <ChakraLink
          as={Link}
          href="/dashboard"
          color="gray.300"
          _hover={{ color: "accent.neon" }}
        >
          Dashboard
        </ChakraLink>
        <ChakraLink
          as={Link}
          href="/add-keyword"
          color="gray.300"
          _hover={{ color: "accent.neon" }}
        >
          Add Keyword
        </ChakraLink>
        <ChakraLink
          as={Link}
          href="/keyword-analysis"
          color="gray.300"
          _hover={{ color: "accent.neon" }}
        >
          Keyword Analysis
        </ChakraLink>
        <ChakraLink
          as={Link}
          href="/schedule"
          color="gray.300"
          _hover={{ color: "accent.neon" }}
        >
          Schedule
        </ChakraLink>
        <ChakraLink
          as={Link}
          href="/teams"
          color="gray.300"
          _hover={{ color: "accent.neon" }}
        >
          Teams
        </ChakraLink>
        <ChakraLink
          as={Link}
          href="/admin/data-sources/weight-management"
          color="gray.300"
          _hover={{ color: "accent.neon" }}
        >
          Weighting
        </ChakraLink>
        <ChakraLink
          as={Link}
          href="/admin/data-sources"
          color="gray.300"
          _hover={{ color: "accent.neon" }}
        >
          Data Sources
        </ChakraLink>
        <Text color="gray.300">
          Welcome, {user.email}{" "}
          <ChakraLink
            href="/api/auth/logout"
            color="accent.neon"
            fontSize="xs"
            _hover={{ textDecoration: "underline" }}
          >
            (Logout)
          </ChakraLink>
        </Text>
      </>
    );
  };

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box as="header" bg="brand.800" px={4} boxShadow="lg">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <ChakraLink as={Link} href="/" _hover={{ textDecoration: "none" }}>
            <Flex alignItems="center">
              <Image
                src="https://status-score-public.s3.us-east-2.amazonaws.com/logo-1.png"
                alt="Logo"
                height={8}
                mr={2}
              />
              <Text fontSize="xl" fontWeight="bold" color="accent.neon">
                Status Score
              </Text>
            </Flex>
          </ChakraLink>
          <HStack
            spacing={8}
            alignItems="center"
            display={{ base: "none", md: "flex" }}
          >
            {renderNavLinks()}
          </HStack>
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
            variant="outline"
            colorScheme="whiteAlpha"
          />
        </Flex>

        {isOpen && (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as="nav" spacing={4}>
              {renderNavLinks()}
            </Stack>
          </Box>
        )}
      </Box>

      <Box as="main" py={0} bg={bgColor} color={textColor}>
        {children}
      </Box>
    </Box>
  );
}
