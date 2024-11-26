import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Heading,
  Textarea,
  useToast,
  VStack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import Layout from "../components/Layout";
import NextLink from "next/link";

const SchedulePage = () => {
  const [keywords, setKeywords] = useState<any[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [emails, setEmails] = useState("");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [hasKeywords, setHasKeywords] = useState(true);
  const toast = useToast();

  const aquamarineColors = {
    4: "#00f8ba",
    300: "#00e5aa",
    500: "#00d299",
    700: "#00bf88",
  };

  useEffect(() => {
    fetchKeywords();
    fetchSchedules();
  }, []);

  // Fetch keywords from backend
  const fetchKeywords = async () => {
    try {
      const response = await axios.get("/api/keywords");
      setKeywords(response.data);
      setHasKeywords(response.data.length > 0);
    } catch (error) {
      console.error("Failed to fetch keywords", error);
      setHasKeywords(false);
    }
  };

  // Fetch schedules from backend
  const fetchSchedules = async () => {
    try {
      const response = await axios.get("/api/schedules");
      setSchedules(response.data);
    } catch (error) {
      console.error("Failed to fetch schedules", error);
    }
  };

  // Save a new schedule
  const handleSaveSchedule = async () => {
    try {
      const payload = {
        keywordId: selectedKeyword,
        frequency,
        emails,
      };

      await axios.post("/api/schedules", payload);
      toast({
        title: "Schedule saved.",
        description: "The schedule has been created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchSchedules(); // Refresh the list of schedules
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save schedule",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Update an existing schedule
  const handleUpdateSchedule = async (id: number) => {
    try {
      await axios.put("/api/schedules", {
        id,
        newFrequency: frequency,
        newEmails: emails,
      });
      toast({
        title: "Schedule updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchSchedules(); // Refresh the list of schedules
    } catch (error) {
      console.error("Failed to update schedule", error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Delete an existing schedule
  const handleDeleteSchedule = async (id: number) => {
    try {
      await axios.delete("/api/schedules", {
        data: { scheduleId: id },
      });
      toast({
        title: "Schedule deleted.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchSchedules(); // Refresh the list of schedules
    } catch (error) {
      console.error("Failed to delete schedule", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!hasKeywords) {
    return (
      <Layout>
        <Box maxW="2xl" mx="auto" py="12" px="6">
          <VStack spacing={8} align="center">
            <Heading as="h2" size="xl" textAlign="center">
              Schedule a Keyword Report
            </Heading>
            <Text fontSize="lg" textAlign="center">
              It looks like you haven't added any keywords yet. Let's start by
              adding your first keyword!
            </Text>
            <Button
              as={NextLink}
              href="/add-keyword"
              size="lg"
              bg={aquamarineColors[4]}
              color="gray.900"
              _hover={{ bg: aquamarineColors[300] }}
            >
              Add Your First Keyword
            </Button>
          </VStack>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box maxW="2xl" mx="auto" py="12" px="6">
        <Heading as="h2" size="xl" textAlign="center" mb={6}>
          Schedule a Keyword Report
        </Heading>

        {/* Form for adding/updating a schedule */}
        <Box
          as="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveSchedule();
          }}
          bg="white"
          p={6}
          shadow="md"
          rounded="lg"
        >
          <FormControl id="keyword" mb={4}>
            <FormLabel>Keyword</FormLabel>
            <Select
              placeholder="Select keyword"
              value={selectedKeyword}
              onChange={(e) => setSelectedKeyword(e.target.value)}
            >
              {keywords.map((keyword) => (
                <option key={keyword.id} value={keyword.id}>
                  {keyword.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl id="frequency" mb={4}>
            <FormLabel>Frequency</FormLabel>
            <Select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </FormControl>

          <FormControl id="emails" mb={4}>
            <FormLabel>Emails (comma-separated)</FormLabel>
            <Textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter email addresses, separated by commas"
            />
          </FormControl>

          <Button type="submit" colorScheme="teal" width="full">
            Save Schedule
          </Button>
        </Box>

        {/* List of existing schedules */}
        <Box mt={8}>
          <Heading as="h3" size="lg" mb={4}>
            Existing Schedules
          </Heading>
          {schedules.length > 0 ? (
            schedules.map((schedule) => (
              <Box
                key={schedule.id}
                mb={4}
                p={4}
                borderWidth="1px"
                rounded="lg"
                bg="gray.100"
              >
                <p>
                  <strong>Keyword:</strong> {schedule.keyword?.name}
                </p>
                <p>
                  <strong>Frequency:</strong> {schedule.frequency}
                </p>
                <p>
                  <strong>Emails:</strong> {schedule.emails}
                </p>

                <Box mt={4}>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    mr={2}
                    onClick={() => {
                      // Set state to edit this specific schedule
                      setSelectedKeyword(schedule.keyword.id.toString());
                      setFrequency(schedule.frequency);
                      setEmails(schedule.emails);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            ))
          ) : (
            <p>No schedules available. Please add a new schedule.</p>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default SchedulePage;
