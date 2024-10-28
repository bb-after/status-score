// src/pages/teams/create.tsx
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";

export default function CreateTeam() {
  const [teamName, setTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/api/teams/create", {
        teamName: teamName,
      });
      router.push(`/teams/${response.data.id}`);
    } catch (error) {
      console.error("Failed to create team:", error);
      alert("Error creating team. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Box maxW="4xl" mx="auto" py="12" px="6">
        <Heading as="h2" size="xl" mb={6}>
          Create a New Team
        </Heading>
        <Box as="form" onSubmit={handleCreateTeam}>
          <FormControl id="teamName" mb={4}>
            <FormLabel>Team Name</FormLabel>
            <Input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter your team name"
              required
            />
          </FormControl>
          <Button type="submit" colorScheme="teal" isLoading={isLoading}>
            Create Team
          </Button>
        </Box>
      </Box>
    </Layout>
  );
}
