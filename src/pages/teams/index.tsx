// src/pages/teams/index.tsx
import { Box, Button, Heading, Stack, Text, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TeamList() {
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/teams"); // Assumes an endpoint to get user's teams
        setTeams(response.data);
      } catch (error) {
        setError("Failed to fetch teams. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeams();
  }, []);

  return (
    <Box maxW="6xl" mx="auto" py="12" px="6">
      <Heading as="h2" size="xl" mb={6}>
        My Teams
      </Heading>
      {isLoading ? (
        <Text>Loading teams...</Text>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : teams.length > 0 ? (
        <Stack spacing={4}>
          {teams.map((team) => (
            <Box key={team.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{team.name}</Heading>
              <Text mt={4}>Members: {team.members.length}</Text>
              <Link href={`/teams/${team.id}`} color="teal.500" mt={2}>
                View Team
              </Link>
            </Box>
          ))}
        </Stack>
      ) : (
        <Text>You are not a member of any teams yet.</Text>
      )}
      <Button mt={8} colorScheme="teal" as={Link} href="/teams/create">
        Create a New Team
      </Button>
    </Box>
  );
}
