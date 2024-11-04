import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { useState } from "react";
import axios from "axios";
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
import Layout from "../../components/Layout";

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
  const [role, setRole] = useState<string>("MEMBER");
  const [members, setMembers] = useState(team.members);

  const addTeamMember = async (): Promise<void> => {
    try {
      const response = await axios.post("/api/teams/invite", {
        teamId: team.id,
        userEmail: email,
        role: role, // Make sure to include the role
      });
      console.log("User invited successfully:", response.data);
      // Update members state after successful invite
      setMembers([...members, response.data.teamUser]);
    } catch (error: any) {
      console.error(
        "Error inviting user:",
        error.response?.data || error.message
      );
      if (error?.response?.data) {
        alert("Error - " + error.response.data.error);
      }
    }
  };

  const updateTeamMemberRole = async (memberId: number, newRole: string) => {
    try {
      await axios.patch(`/api/teams/members/${memberId}`, {
        role: newRole,
      });
      // Update members state with the new role
      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
    } catch (error: any) {
      console.error(
        "Error updating member role:",
        error.response?.data || error.message
      );
      if (error.response?.data?.error) {
        alert("Failed - " + error.response?.data?.error);
      }
    }
  };

  const deleteTeamMember = async (memberId: number) => {
    try {
      await axios.delete(`/api/teams/members/${memberId}`);
      // Remove member from the members state
      setMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId)
      );
    } catch (error: any) {
      console.error(
        "Error deleting member:",
        error.response?.data || error.message
      );

      if (error.response?.data?.error) {
        alert("Failed - " + error.response?.data?.error);
      }
    }
  };

  return (
    <Layout>
      <Box maxW="6xl" mx="auto" py="12" px="6">
        <Heading as="h2" size="xl" mb={6}>
          Team: {team.name}
        </Heading>

        <Box mt={8}>
          <Heading as="h3" size="md" mb={4}>
            Team Members
          </Heading>
          {members.length === 0 ? (
            <Text>No members yet.</Text>
          ) : (
            <Stack spacing={4}>
              {members.map((member) => (
                <Box key={member.id} p={4} borderWidth="1px" borderRadius="lg">
                  <Text>
                    <strong>Name:</strong> {member.user.name || "Unnamed User"}
                  </Text>
                  <Text>
                    <strong>Email:</strong> {member.user.email}
                  </Text>
                  <Text>
                    <strong>Role:</strong>
                    <Select
                      value={member.role}
                      onChange={(e) =>
                        updateTeamMemberRole(member.id, e.target.value)
                      }
                      size="sm"
                      mt={2}
                    >
                      <option value="STANDARD">Standard Member</option>
                      <option value="ADMIN">Admin Member</option>
                    </Select>
                  </Text>
                  <Button
                    mt={4}
                    colorScheme="red"
                    size="sm"
                    onClick={() => deleteTeamMember(member.id)}
                  >
                    Remove Member
                  </Button>
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
    </Layout>
  );
};

export default TeamPage;
