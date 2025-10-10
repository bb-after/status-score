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
  VStack,
  Text,
  Image,
  Link,
  Spinner,
  Container,
  Heading,
  Tooltip,
  Badge,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, InfoIcon, StarIcon } from "@chakra-ui/icons";
import { FiBarChart2, FiSearch, FiHome, FiUsers, FiCalendar, FiFileText, FiSettings, FiLogOut, FiTrendingUp } from "react-icons/fi";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

const Links = [
  { name: "Dashboard", href: "/dashboard", icon: FiHome },
  { name: "Keywords", href: "/keywords", icon: FiFileText },
  { name: "Reputation Analyzer", href: "/reputation", icon: FiTrendingUp },
  { name: "Reputation Check", href: "/medsearch", icon: FiSearch },
  { name: "Calculator", href: "/calc", icon: FiBarChart2 },
  { name: "Schedule", href: "/schedule", icon: FiCalendar },
  { name: "Team", href: "/teams", icon: FiUsers },
];

const NavLink = ({ children, href, icon }: { children: ReactNode; href: string; icon: any }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <NextLink href={href}>
      <Link
        as="div"
        px={4}
        py={2}
        borderRadius="md"
        color={isActive ? "blue.600" : "gray.700"}
        bg={isActive ? "blue.50" : "transparent"}
        fontWeight={isActive ? "bold" : "medium"}
        display="flex"
        alignItems="center"
        _hover={{
          bg: "blue.50",
          color: "blue.600",
        }}
        transition="all 0.2s"
      >
        <Box as={icon} mr={2} />
        {children}
        {href === "/medsearch" && (
          <Badge ml={2} colorScheme="green" fontSize="xs">
            New
          </Badge>
        )}
      </Link>
    </NextLink>
  );
};

export default function Layout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();
  
  const handleSignOut = async () => {
    await axios.post("/api/auth/logout", {}, { withCredentials: true });
    router.push("/");
  };

  if (isLoading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  const isHomePage = pathname === "/";
  const showFullNav = isAuthenticated || !isHomePage;
  
  // Determine if we're on a reputation page
  const isReputationPage = pathname === "/medsearch" || pathname === "/calc";

  return (
    <Flex flexDirection="column" minHeight="100vh" bg="gray.50">
      {/* Top Navigation */}
      <Box 
        bg="white" 
        boxShadow="sm" 
        position="sticky" 
        top="0" 
        zIndex="100"
        borderBottom="1px"
        borderColor="gray.100"
      >
        <Container maxW="7xl">
          <Flex h={16} alignItems="center" justifyContent="space-between">
            {showFullNav && (
              <IconButton
                size="md"
                icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                aria-label="Open Menu"
                display={{ md: "none" }}
                onClick={isOpen ? onClose : onOpen}
                variant="ghost"
              />
            )}
            
            <HStack spacing={4} alignItems="center">
              <NextLink href="/">
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={2} 
                  cursor="pointer"
                  _hover={{ opacity: 0.8 }}
                  transition="opacity 0.2s"
                >
                  <Flex 
                    alignItems="center" 
                    justifyContent="center" 
                    w="40px" 
                    h="40px" 
                    bg="blue.500" 
                    color="white"
                    borderRadius="md"
                    fontWeight="bold"
                    fontSize="xl"
                  >
                    AI
                  </Flex>
                  <Heading size="md" color="blue.800">
                    {isReputationPage ? "AI Reputation Checker" : "Status Score"}
                  </Heading>
                </Box>
              </NextLink>
            </HStack>
            
            <Flex alignItems="center" gap={4}>
              {isReputationPage && (
                <Tooltip label="Enterprise-grade reputation management" placement="bottom">
                  <Button 
                    leftIcon={<StarIcon />} 
                    colorScheme="blue" 
                    size="sm" 
                    variant="outline"
                    display={{ base: "none", md: "flex" }}
                  >
                    Enterprise
                  </Button>
                </Tooltip>
              )}
              
              {showFullNav ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded="full"
                    cursor="pointer"
                    minW={0}
                    variant="ghost"
                    colorScheme="gray"
                    height="auto"
                    p={1}
                    _hover={{
                      bg: "gray.100"
                    }}
                  >
                    <HStack spacing={2} alignItems="center">
                      <Avatar
                        size="sm"
                        name={user?.name || user?.email || ""}
                        src={user?.picture}
                        onError={() =>
                          console.log("Avatar image failed to load:", user?.picture)
                        }
                        referrerPolicy="no-referrer"
                      />
                      <Text 
                        fontWeight="medium" 
                        color="gray.700" 
                        display={{ base: "none", md: "block" }}
                        fontSize="sm"
                        maxW="150px"
                        isTruncated
                      >
                        {user?.name || user?.email || "User"}
                      </Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    <MenuItem as={NextLink} href="/profile" icon={<FiUsers />}>
                      Profile
                    </MenuItem>
                    <MenuItem as={NextLink} href="/settings" icon={<FiSettings />}>
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
                      icon={<FiLogOut />}
                    >
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Button as={NextLink} href="/api/auth/login" colorScheme="blue">
                  Login
                </Button>
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Sidebar and Main Content */}
      <Flex flex="1">
        {showFullNav && (
          <>
            {/* Desktop Sidebar */}
            <Box
              width="250px"
              bg="white"
              minH="calc(100vh - 64px)"
              display={{ base: "none", md: "block" }}
              borderRight="1px"
              borderColor="gray.100"
              position="sticky"
              top="64px"
              height="calc(100vh - 64px)"
              overflowY="auto"
            >
              <VStack align="stretch" py={4} spacing={1}>
                {Links.map((link) => (
                  <NavLink key={link.name} href={link.href} icon={link.icon}>
                    {link.name}
                  </NavLink>
                ))}
              </VStack>
            </Box>
            
            {/* Mobile Navigation Drawer */}
            {isOpen && (
              <Box
                bg="white"
                w="full"
                pos="fixed"
                top="64px"
                left={0}
                zIndex={20}
                h="100vh"
                overflowY="auto"
                pb={8}
                display={{ md: "none" }}
              >
                <VStack align="stretch" py={4} spacing={1}>
                  {Links.map((link) => (
                    <NavLink key={link.name} href={link.href} icon={link.icon}>
                      {link.name}
                    </NavLink>
                  ))}
                </VStack>
              </Box>
            )}
          </>
        )}

        {/* Main Content */}
        <Box as="main" flex="1" py={0} width={{ base: "100%", md: showFullNav ? "calc(100% - 250px)" : "100%" }}>
          {children}
        </Box>
      </Flex>

      {/* Footer */}
      <Box
        as="footer"
        bg="white"
        py={6}
        px={4}
        textAlign="center"
        mt="auto"
        borderTop="1px"
        borderColor="gray.100"
      >
        <Container maxW="7xl">
          <Text color="gray.500" fontSize="sm">
            © {new Date().getFullYear()} AI Reputation Checker. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Flex>
  );
}
