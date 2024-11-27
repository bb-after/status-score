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
  AvatarBadge,
  AvatarProps,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { createAvatar } from "@dicebear/core";
import { initials } from "@dicebear/collection";

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
    color={"white"}
    _hover={{
      textDecoration: "underline",
    }}
    href={href}
  >
    {children}
  </Link>
);

const generateDiceBearAvatar = (name: string) => {
  const avatar = createAvatar(initials, {
    seed: name,
    backgroundColor: ["#00f8ba"],
    fontFamily: ["Arial"],
  });
  return avatar.toDataUri();
};

const UserAvatar: React.FC<
  AvatarProps & { name: string; email: string; avatar?: string }
> = ({ name, email, avatar, ...props }) => {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : email.substring(0, 2).toUpperCase();

  return (
    <Avatar
      name={name || email}
      src={avatar || generateDiceBearAvatar(name || email)}
      {...props}
    >
      {props.children}
    </Avatar>
  );
};

export default function Layout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    picture?: string;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/auth/me", {
          withCredentials: true,
        });
        if (response.data) {
          console.log("user!", response.data);
          setIsAuthenticated(true);
          setUser(response.data);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

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
                  <UserAvatar
                    size="sm"
                    name={user?.name || ""}
                    email={user?.email || ""}
                    avatar={user?.picture}
                  ></UserAvatar>
                </MenuButton>
                <MenuList>
                  <MenuItem as={NextLink} href="/profile">
                    Profile
                  </MenuItem>
                  <MenuItem as={NextLink} href="/settings">
                    Settings
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem as={NextLink} href="/api/auth/logout">
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
