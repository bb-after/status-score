"use client";

import React, { ReactNode, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Text,
  Image,
  Link,
  Spinner,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";

const Links = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Keywords", href: "/keywords" },
  { name: "Schedule", href: "/schedule" },
  { name: "Team", href: "/teams" },
];

const NavLink = ({ children, href }: { children: ReactNode; href: string }) => (
  <Link
    as={NextLink}
    px={2}
    py={1}
    // rounded={"md"}
    _hover={{
      textDecoration: "underline",
      // bg: "gray.200",
    }}
    href={href}
  >
    {children}
  </Link>
);

export default function Layout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/auth/me", {
          withCredentials: true,
        });
        if (response.data) {
          setIsAuthenticated(true);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    if (pathname === "/") {
      setIsLoading(false);
      setIsAuthenticated(true);
    } else {
      checkAuth();
    }
  }, [pathname, router]);

  if (isLoading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!isAuthenticated && pathname !== "/") {
    return null;
  }

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <Box bg={"gray.900"} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <Box>
              <Image
                src="https://status-score-public.s3.us-east-2.amazonaws.com/SL_S+emblem_white-01.png"
                alt="Status Labs Logo"
                h="20px"
                objectFit="contain"
              />
            </Box>
            <HStack
              as={"nav"}
              spacing={4}
              color={"white"}
              display={{ base: "none", md: "flex" }}
            >
              {Links.map((link) => (
                <NavLink key={link.name} href={link.href}>
                  {link.name}
                </NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            <Menu>
              <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
              >
                <Avatar
                  size={"sm"}
                  src={
                    "https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                  }
                />
              </MenuButton>
              <MenuList>
                <MenuItem>Profile</MenuItem>
                <MenuItem>Settings</MenuItem>
                <MenuDivider />
                <MenuItem as={NextLink} href="/api/auth/logout">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link.name} href={link.href}>
                  {link.name}
                </NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Box as="main" flex="1" py={0}>
        {children}
      </Box>

      <Box
        as="footer"
        bg="brand.800"
        py={4}
        px={4}
        textAlign="center"
        mt="auto"
      >
        <Text color="gray.300" fontSize="sm">
          © {new Date().getFullYear()} Status Labs. All rights reserved.
        </Text>
      </Box>
    </Flex>
  );
}
