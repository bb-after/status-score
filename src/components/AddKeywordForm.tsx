// components/AddKeywordForm.tsx
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
} from "@chakra-ui/react";

const AddKeywordForm = () => {
  const [keyword, setKeyword] = useState("");
  const [score, setScore] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = 1; // Hardcoded user ID for now

    try {
      const response = await fetch("/api/keywords/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword, score, userId, selectedSources }),
      });

      if (response.ok) {
        setMessage("Keyword and data sources added successfully!");
        setKeyword("");
        setScore("");
        setSelectedSources([]);
      } else {
        setMessage("Error adding keyword and data sources");
      }
    } catch (error) {
      setMessage("Error adding keyword and data sources");
    }
  };

  return (
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
          placeholder="Enter keyword"
        />
      </FormControl>
      <FormControl id="score" mb={4}>
        <FormLabel>Sentiment Score</FormLabel>
        <Input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="Enter sentiment score (optional)"
        />
      </FormControl>
      <FormControl id="sources" mb={4}>
        <FormLabel>Select Data Sources</FormLabel>
        <Select
          //   multiple
          placeholder="Select data sources"
          value={selectedSources}
          onChange={(e) =>
            setSelectedSources(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
        >
          <option value="openai-davinci">OpenAI Davinci</option>
          <option value="openai-curie">OpenAI Curie</option>
          <option value="openai-babbage">OpenAI Babbage</option>
          <option value="gemini">Gemini</option>
          <option value="grok">Grok</option>
          <option value="claude">Claude</option>
          <option value="google-search">Google Search</option>
          <option value="social-media">Social Media</option>
        </Select>
      </FormControl>
      <Button type="submit" colorScheme="teal" width="full">
        Add Keyword
      </Button>
      {message && (
        <Text mt={4} color="green.500">
          {message}
        </Text>
      )}
    </Box>
  );
};

export default AddKeywordForm;
