// src/pages/teams/[id].tsx
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { useState } from "react";
import prisma from "../../lib/prisma";
import {
  Box,
  Heading,
  Text,
  Button,
  Input,
  Select,
  Stack,
} from "@chakra-ui/react";

interface TeamPageProps {
  team: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    members: {
      id: number;
      role: string;
      createdAt: string;
      user: {
        id: number;
        name: string;
        email: string;
      };
    }[];
  };
}

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;
  if (!params || typeof params.id !== "string") {
    return {
      notFound: true,
    };
  }

  const team = await prisma.team.findUnique({
    where: { id: Number(params.id) },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!team) {
    return {
      notFound: true,
    };
  }

  // Serialize all Date fields to strings
  const serializedTeam = {
    ...team,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    members: team.members.map((member) => ({
      ...member,
      createdAt: member.createdAt.toISOString(),
      user: {
        ...member.user,
        createdAt: member.user.createdAt.toISOString(),
      },
    })),
  };

  return {
    props: {
      team: serializedTeam,
    },
  };
};

const TeamPage = ({ team }: TeamPageProps) => {
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("STANDARD");

  const addTeamMember = async () => {
    try {
      const response = await fetch(`/api/teams/${team.id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      if (response.ok) {
        alert("Invitation sent!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to send invite.");
    }
  };

  return (
    <Box maxW="6xl" mx="auto" py="12" px="6">
      <Heading as="h2" size="xl" textAlign="center" mb={6}>
        Team: {team.name}
      </Heading>

      <Box mt={8}>
        <Heading as="h3" size="md" mb={4}>
          Team Members
        </Heading>
        {team.members.length === 0 ? (
          <Text>No members yet.</Text>
        ) : (
          <Stack spacing={4}>
            {team.members.map((member) => (
              <Box key={member.id} p={4} borderWidth="1px" borderRadius="lg">
                <Text>
                  <strong>Name:</strong> {member.user.name || "Unnamed User"}
                </Text>
                <Text>
                  <strong>Email:</strong> {member.user.email}
                </Text>
                <Text>
                  <strong>Role:</strong> {member.role}
                </Text>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Box mt={10}>
        <Heading as="h3" size="md" mb={4}>
          Add a New Team Member
        </Heading>
        <Stack spacing={4} mb={4}>
          <Input
            placeholder="Email of the new member"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="STANDARD">Standard Member</option>
            <option value="ADMIN">Admin Member</option>
          </Select>
          <Button onClick={addTeamMember} colorScheme="teal">
            Send Invitation
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default TeamPage;
