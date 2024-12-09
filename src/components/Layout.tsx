import React, { ReactNode, useEffect, useState, useCallback } from "react";
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
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const Links = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Keywords", href: "/keywords" },
  { name: "Schedule", href: "/schedule" },
  { name: "Team", href: "/teams" },
];

const NavLink = ({ children, href }: { children: ReactNode; href: string }) => (
  <NextLink href={href}>
    <Link
      as={NextLink}
      px={2}
      py={1}
      color={"white"}
      _hover={{
        textDecoration: "underline",
      }}
      href={href}
    >
      {children}
    </Link>
  </NextLink>
);

export default function Layout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();
  console.log("Auth state in Layout:", { isAuthenticated, user, isLoading });

  const handleSignOut = async () => {
    await axios.post("/api/auth/logout", {}, { withCredentials: true });
    router.push("/");
  };

  if (isLoading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const isHomePage = pathname === "/";
  const showFullNav = isAuthenticated || !isHomePage;

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <Box bg={"gray.900"} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          {showFullNav && (
            <IconButton
              size={"md"}
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label={"Open Menu"}
              display={{ md: "none" }}
              onClick={isOpen ? onClose : onOpen}
            />
          )}
          <HStack spacing={8} alignItems={"center"}>
            <Box>
              <Image
                src="https://status-score-public.s3.us-east-2.amazonaws.com/SL_S+emblem_white-01.png"
                alt="Status Labs Logo"
                h="20px"
                objectFit="contain"
              />
            </Box>
            <Text color="white" fontWeight="bold">
              Status Score
            </Text>
            {showFullNav && (
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
            )}
          </HStack>
          <Flex alignItems={"center"}>
            {showFullNav ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                  minW={0}
                >
                  <Avatar
                    size="sm"
                    name={user?.name || user?.email || ""}
                    src={user?.picture}
                    onError={() =>
                      console.log("Avatar image failed to load:", user?.picture)
                    }
                    referrerPolicy="no-referrer"
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem as={NextLink} href="/profile">
                    Profile
                  </MenuItem>
                  <MenuItem as={NextLink} href="/settings">
                    Settings
                  </MenuItem>
                  <MenuDivider />
                  {user?.admin && (
                    <>
                      <MenuItem as={NextLink} href="/admin/data-sources">
                        Admin: Data Sources
                      </MenuItem>
                      <MenuItem
                        as={NextLink}
                        href="/admin/data-sources/weight-management"
                      >
                        Admin: Data Source Weighting
                      </MenuItem>
                      <MenuDivider />
                    </>
                  )}
                  <MenuItem
                    as={NextLink}
                    href="/api/auth/logout"
                    onClick={handleSignOut}
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button as={NextLink} href="/api/auth/login" colorScheme="teal">
                Login
              </Button>
            )}
          </Flex>
        </Flex>

        {isOpen && showFullNav ? (
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
