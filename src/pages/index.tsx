import { useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
} from "@chakra-ui/react";
import DemoModal from "../components/DemoModal";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleDashboardNavigation = () => {
    router.push("/reputation");
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box
        as="header"
        bg="white"
        shadow="sm"
        borderBottom="1px"
        borderColor="gray.200"
      >
        <Container maxW="7xl">
          <Flex justify="space-between" align="center" h={16}>
            <HStack align="center" spacing={2}>
              <Image
                src="https://static.readdy.ai/image/45a01c2f2d1de986a5803f825a3dccfb/775c6703445b4edf65450cb7d88e7489.png"
                alt="Status Labs"
                h="32px"
                objectFit="contain"
              />
            </HStack>
            <HStack spacing={3}>
              {!user ? (
                <>
                  <Button
                    onClick={() => setShowNewsletterModal(true)}
                    variant="ghost"
                    color="teal.700"
                    size="sm"
                    fontWeight="medium"
                  >
                    📧 Weekly Updates
                  </Button>
                  <Button
                    onClick={() => setShowContactModal(true)}
                    variant="ghost"
                    color="teal.700"
                    size="sm"
                    fontWeight="medium"
                  >
                    Contact Sales
                  </Button>
                  <Button
                    as="a"
                    href="/api/auth/login"
                    bgGradient="linear(to-r, teal.800, teal.400)"
                    color="white"
                    size="sm"
                    fontWeight="medium"
                    _hover={{ bgGradient: "linear(to-r, teal.900, teal.500)" }}
                  >
                    Login
                  </Button>
                </>
              ) : (
                <>
                  <Text color="teal.700" size="sm" fontWeight="medium">
                    Welcome back, {user.name}!
                  </Text>
                  <Button
                    onClick={handleDashboardNavigation}
                    bgGradient="linear(to-r, teal.800, teal.400)"
                    color="white"
                    size="sm"
                    fontWeight="medium"
                    _hover={{ bgGradient: "linear(to-r, teal.900, teal.500)" }}
                  >
                    View Dashboard
                  </Button>
                  <Button
                    as="a"
                    href="/api/auth/logout"
                    variant="ghost"
                    color="teal.700"
                    size="sm"
                    fontWeight="medium"
                  >
                    Logout
                  </Button>
                </>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box position="relative" overflow="hidden">
        <Box
          position="absolute"
          inset={0}
          bgImage="url('https://readdy.ai/api/search-image?query=Professional%20business%20analytics%20dashboard%20with%20clean%20modern%20interface%20showing%20data%20visualization%20charts%20and%20graphs%20on%20computer%20screens%20in%20a%20bright%20contemporary%20office%20environment%20with%20soft%20lighting%20and%20minimalist%20design%20elements&width=1200&height=600&seq=hero-bg&orientation=landscape')"
          bgSize="cover"
          bgPosition="center"
          bgRepeat="no-repeat"
        >
          <Box
            position="absolute"
            inset={0}
            bgGradient="linear(to-r, teal.900, teal.600)"
            opacity={0.85}
          />
        </Box>

        <Container maxW="7xl" position="relative" py={24}>
          <Box maxW="3xl">
            <Heading
              as="h1"
              fontSize="5xl"
              fontWeight="bold"
              color="white"
              mb={6}
              lineHeight="tight"
            >
              Monitor Your Online Reputation with Precision
            </Heading>
            <Text fontSize="xl" color="teal.100" mb={8} lineHeight="relaxed">
              Get a comprehensive reputation score that tracks your online
              presence across Google search results. Monitor positive content,
              suppress negative links, and maintain your digital reputation with
              our automated weekly updates.
            </Text>
            <VStack spacing={4} align="flex-start">
              <HStack spacing={4}>
                <Button
                  onClick={handleDashboardNavigation}
                  bg="white"
                  color="teal.700"
                  size="lg"
                  fontWeight="semibold"
                  _hover={{ bg: "gray.50" }}
                  leftIcon={<span>📊</span>}
                >
                  View Live Dashboard
                </Button>
                <Button
                  onClick={() => setShowDemoModal(true)}
                  variant="outline"
                  borderColor="white"
                  color="white"
                  size="lg"
                  fontWeight="semibold"
                  _hover={{ bg: "white", color: "teal.700" }}
                  leftIcon={<span>▶️</span>}
                >
                  Watch Demo
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={24} bg="white">
        <Container maxW="7xl">
          <VStack spacing={16}>
            <Box textAlign="center" mb={16}>
              <Heading
                as="h2"
                fontSize="4xl"
                fontWeight="bold"
                color="gray.900"
                mb={4}
              >
                Complete Reputation Intelligence
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
                Our advanced scoring system analyzes multiple data points to
                give you a comprehensive view of your online reputation health.
              </Text>
            </Box>

            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap={8}
            >
              <GridItem>
                <VStack spacing={4} textAlign="center" p={6}>
                  <Box
                    w={16}
                    h={16}
                    bgGradient="linear(to-r, teal.100, cyan.100)"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xl" color="teal.600">
                      📰
                    </Text>
                  </Box>
                  <Heading
                    as="h3"
                    fontSize="xl"
                    fontWeight="semibold"
                    color="gray.900"
                  >
                    Positive Content Tracking
                  </Heading>
                  <Text color="gray.600">
                    Monitor high-quality positive articles and content in top
                    Google search results with weighted scoring for top 10
                    positions.
                  </Text>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack spacing={4} textAlign="center" p={6}>
                  <Box
                    w={16}
                    h={16}
                    bgGradient="linear(to-r, teal.200, teal.100)"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xl" color="teal.700">
                      🛡️
                    </Text>
                  </Box>
                  <Heading
                    as="h3"
                    fontSize="xl"
                    fontWeight="semibold"
                    color="gray.900"
                  >
                    Negative Link Suppression
                  </Heading>
                  <Text color="gray.600">
                    Identify and track damaging content on page 1 results with
                    heavy negative weighting to protect your reputation.
                  </Text>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack spacing={4} textAlign="center" p={6}>
                  <Box
                    w={16}
                    h={16}
                    bgGradient="linear(to-r, cyan.100, teal.100)"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xl" color="teal.600">
                      📖
                    </Text>
                  </Box>
                  <Heading
                    as="h3"
                    fontSize="xl"
                    fontWeight="semibold"
                    color="gray.900"
                  >
                    Wikipedia Presence
                  </Heading>
                  <Text color="gray.600">
                    Track the quality and maintenance of your Wikipedia page
                    with our 5-point rating system for credibility assessment.
                  </Text>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack spacing={4} textAlign="center" p={6}>
                  <Box
                    w={16}
                    h={16}
                    bgGradient="linear(to-r, teal.100, cyan.100)"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xl" color="teal.600">
                      📱
                    </Text>
                  </Box>
                  <Heading
                    as="h3"
                    fontSize="xl"
                    fontWeight="semibold"
                    color="gray.900"
                  >
                    Social Media Analysis
                  </Heading>
                  <Text color="gray.600">
                    Monitor your presence across Reddit, YouTube, and news
                    platforms to boost or identify reputation risks.
                  </Text>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack spacing={4} textAlign="center" p={6}>
                  <Box
                    w={16}
                    h={16}
                    bgGradient="linear(to-r, cyan.100, teal.200)"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xl" color="teal.700">
                      🤖
                    </Text>
                  </Box>
                  <Heading
                    as="h3"
                    fontSize="xl"
                    fontWeight="semibold"
                    color="gray.900"
                  >
                    AI Overview Tracking
                  </Heading>
                  <Text color="gray.600">
                    Track favorable mentions in AI Overviews and People Also Ask
                    sections for modern search visibility.
                  </Text>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack spacing={4} textAlign="center" p={6}>
                  <Box
                    w={16}
                    h={16}
                    bgGradient="linear(to-r, teal.200, cyan.100)"
                    rounded="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xl" color="teal.700">
                      📈
                    </Text>
                  </Box>
                  <Heading
                    as="h3"
                    fontSize="xl"
                    fontWeight="semibold"
                    color="gray.900"
                  >
                    Historical Tracking
                  </Heading>
                  <Text color="gray.600">
                    View score progression over time with detailed historical
                    charts and trend analysis for strategic planning.
                  </Text>
                </VStack>
              </GridItem>
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={24} bgGradient="linear(to-r, teal.800, teal.400)">
        <Container maxW="4xl" textAlign="center">
          <VStack spacing={8}>
            <Heading as="h2" fontSize="4xl" fontWeight="bold" color="white">
              Ready to Monitor Your Reputation Score?
            </Heading>
            <Text fontSize="xl" color="teal.100">
              Start tracking your online reputation with our comprehensive
              scoring system. Get insights that matter for your business
              success.
            </Text>
            <HStack spacing={4} justify="center">
              <Button
                onClick={handleDashboardNavigation}
                bg="white"
                color="teal.700"
                size="lg"
                fontWeight="semibold"
                _hover={{ bg: "gray.50" }}
                leftIcon={<span>📊</span>}
              >
                Launch Dashboard
              </Button>
              <Button
                onClick={() => setShowContactModal(true)}
                variant="outline"
                borderColor="white"
                color="white"
                size="lg"
                fontWeight="semibold"
                _hover={{ bg: "white", color: "teal.700" }}
                leftIcon={<span>📞</span>}
              >
                Talk to Sales
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" bg="gray.900" color="white" py={12}>
        <Container maxW="7xl">
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={8}>
            <GridItem>
              <VStack align="flex-start" spacing={4}>
                <Image
                  src="https://static.readdy.ai/image/45a01c2f2d1de986a5803f825a3dccfb/c79419efaec7def650aec8f4d3417a5a.png"
                  alt="Status Labs"
                  h="32px"
                  objectFit="contain"
                />
                <Text color="gray.400">
                  Professional reputation management and monitoring solutions
                  for individuals and companies.
                </Text>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="flex-start" spacing={4}>
                <Heading as="h4" fontSize="md" fontWeight="semibold">
                  Company
                </Heading>
                <VStack align="flex-start" spacing={2} color="gray.400">
                  <Text
                    as="a"
                    href="https://statuslabs.com/about"
                    target="_blank"
                    rel="noopener noreferrer"
                    _hover={{ color: "white" }}
                    cursor="pointer"
                  >
                    About Status Labs
                  </Text>
                  <Text
                    as="a"
                    href="https://statuslabs.com/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    _hover={{ color: "white" }}
                    cursor="pointer"
                  >
                    Contact Us
                  </Text>
                  <Text
                    as="a"
                    href="https://statuslabs.com/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    _hover={{ color: "white" }}
                    cursor="pointer"
                  >
                    Terms
                  </Text>
                </VStack>
              </VStack>
            </GridItem>
          </Grid>

          <Flex
            borderTop="1px"
            borderColor="gray.800"
            mt={8}
            pt={8}
            justify="space-between"
            align="center"
            direction={{ base: "column", sm: "row" }}
          >
            <Text color="gray.400" fontSize="sm">
              © 2024 Status Labs. All rights reserved.
            </Text>
            <Text
              as="a"
              href="https://readdy.ai/?origin=logo"
              color="gray.400"
              _hover={{ color: "white" }}
              fontSize="sm"
              mt={{ base: 4, sm: 0 }}
              cursor="pointer"
            >
              Powered by Readdy
            </Text>
          </Flex>
        </Container>
      </Box>

      {/* Placeholder modals - you can implement these later */}
      {showContactModal && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
          onClick={() => setShowContactModal(false)}
        >
          <Box
            bg="white"
            p={6}
            rounded="lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Text>Contact Modal - Implement as needed</Text>
            <Button mt={4} onClick={() => setShowContactModal(false)}>
              Close
            </Button>
          </Box>
        </Box>
      )}

      {showNewsletterModal && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
          onClick={() => setShowNewsletterModal(false)}
        >
          <Box
            bg="white"
            p={6}
            rounded="lg"
            onClick={(e) => e.stopPropagation()}
          >
            <Text>Newsletter Modal - Implement as needed</Text>
            <Button mt={4} onClick={() => setShowNewsletterModal(false)}>
              Close
            </Button>
          </Box>
        </Box>
      )}

      <DemoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />
    </Box>
  );
}
