import { Box, Heading, Button, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const AdminDataSourcesList = () => {
  const [dataSources, setDataSources] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      const response = await axios.get("/api/datasources");
      setDataSources(response.data);
    } catch (error) {
      console.error("Failed to fetch data sources", error);
    }
  };

  const handleToggleActive = async (id, activeStatus) => {
    try {
      await axios.put(`/api/datasources/${id}`, { active: !activeStatus });
      fetchDataSources();
    } catch (error) {
      console.error("Failed to update data source", error);
    }
  };

  return (
    <Box maxW="2xl" mx="auto" py="12" px="6">
      <Heading as="h2" size="xl" textAlign="center" mb={6}>
        Admin: Manage Data Sources
      </Heading>

      <Box>
        {dataSources.map((dataSource) => (
          <Box
            key={dataSource.id}
            bg="gray.100"
            p={4}
            mb={4}
            rounded="lg"
            shadow="md"
          >
            <Heading as="h4" size="md">
              {dataSource.name}
            </Heading>
            <Text mt={2}>Model: {dataSource.model}</Text>
            <Text mt={2}>Active: {dataSource.active ? "Yes" : "No"}</Text>
            <Box mt={4}>
              <Button
                colorScheme="teal"
                size="sm"
                onClick={() =>
                  router.push(`/admin/data-sources/${dataSource.id}`)
                }
                mr={2}
              >
                Edit
              </Button>
              <Button
                colorScheme={dataSource.active ? "red" : "green"}
                size="sm"
                onClick={() =>
                  handleToggleActive(dataSource.id, dataSource.active)
                }
              >
                {dataSource.active ? "Deactivate" : "Activate"}
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
      <Button
        mt={6}
        colorScheme="teal"
        onClick={() => router.push("/admin/data-sources/add")}
      >
        Add New Data Source
      </Button>
    </Box>
  );
};

export default AdminDataSourcesList;
