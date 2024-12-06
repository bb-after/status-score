import { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import Loader from "../components/Loader"; // Reusing the Loader component

const AddKeywordForm = () => {
  const [keyword, setKeyword] = useState("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch available data sources when the component mounts
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!keyword) {
      alert("Please enter a keyword and select a data source.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Send POST request to backend to add the keyword and trigger sentiment analysis
      await axios.post("/api/keywords/add", {
        keyword,
      });

      // Redirect or reset after successful submission
      setKeyword("");
      router.push("/keywords");
    } catch (error) {
      console.error("Failed to add keyword", error);
      setError("Failed to add keyword. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box maxW="2xl" mx="auto" py="12" px="6">
      {/* Show error if it exists */}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!error && (
        <Box
          as="form"
          onSubmit={handleSubmit}
          bg="white"
          p={6}
          shadow="md"
          rounded="lg"
          maxW="xl"
          mx="auto"
        >
          <FormControl id="keyword" mb={4}>
            <FormLabel>Keyword</FormLabel>
            <Input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter a keyword to analyze"
            />
          </FormControl>

          {/* Show loader button while submitting */}
          {submitting ? (
            <Loader />
          ) : (
            <Button type="submit" colorScheme="teal" width="full">
              Add Keyword
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AddKeywordForm;
