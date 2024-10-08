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
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

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
            <Link href="/" color="gray.300">
              Home
            </Link>
            <Link href="/dashboard" color="gray.300">
              Dashboard
            </Link>
            <Link href="/add-keyword" color="gray.300">
              Add Keyword
            </Link>
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
              <Link href="/" color="gray.300">
                Home
              </Link>
              <Link href="/dashboard" color="gray.300">
                Dashboard
              </Link>
              <Link href="/add-keyword" color="gray.300">
                Add Keyword
              </Link>
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Box>{children}</Box>
    </>
  );
}
