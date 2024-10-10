import { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  Textarea,
  Checkbox,
  Button,
} from "@chakra-ui/react";
import axios from "axios";
import Layout from "../../components/Layout";

const AdminDataSources = () => {
  const [dataSources, setDataSources] = useState([]);
  const [newDataSource, setNewDataSource] = useState({
    name: "",
    model: "",
    prompt: "",
    active: true,
  });

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

  const handleCreateDataSource = async () => {
    try {
      await axios.post("/api/datasources", newDataSource);
      setNewDataSource({ name: "", model: "", prompt: "", active: true });
      fetchDataSources();
    } catch (error) {
      console.error("Failed to create data source", error);
    }
  };

  const handleUpdateDataSource = async (id, updatedData) => {
    try {
      await axios.put(`/api/datasources/${id}`, updatedData);
      fetchDataSources();
    } catch (error) {
      console.error("Failed to update data source", error);
    }
  };
  /***
 * <Box
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
 */

  return (
    <Layout>
      <Box maxW="2xl" mx="auto" py="12" px="6">
        <Heading as="h2" size="xl" textAlign="center" mb={6}>
          Admin: Manage Data Sources
        </Heading>

        <Box
          as="form"
          onSubmit={handleCreateDataSource}
          bg="white"
          p={6}
          shadow="md"
          rounded="lg"
          maxW="xl"
          mx="auto"
        >
          <FormControl id="datasource" mb={4}>
            <FormLabel>Data Source Name</FormLabel>

            <Input
              type="text"
              placeholder="Eg. OpenAI"
              value={newDataSource.name}
              onChange={(e) =>
                setNewDataSource({ ...newDataSource, name: e.target.value })
              }
            />
          </FormControl>
          <FormControl id="model" mb={4}>
            <FormLabel>Model Name</FormLabel>
            <Input
              type="text"
              placeholder="text-davinci-003"
              value={newDataSource.model}
              onChange={(e) =>
                setNewDataSource({ ...newDataSource, model: e.target.value })
              }
            />
          </FormControl>
          <FormControl id="prompt" mb={4}>
            <FormLabel>Prompt</FormLabel>
            <Textarea
              placeholder="Eg. Analyze the sentiment of the following content:"
              value={newDataSource.prompt}
              onChange={(e) =>
                setNewDataSource({ ...newDataSource, prompt: e.target.value })
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Active</FormLabel>
            <Checkbox
              checked={newDataSource.active}
              onChange={(e) =>
                setNewDataSource({ ...newDataSource, active: e.target.checked })
              }
            />
          </FormControl>
          <Button type="submit" colorScheme="teal" width="full">
            Create Data Source
          </Button>
        </Box>

        <div>
          <h3>Existing Data Sources</h3>
          {dataSources.map((dataSource) => (
            <div key={dataSource.id}>
              <input
                type="text"
                value={dataSource.name}
                onChange={(e) =>
                  handleUpdateDataSource(dataSource.id, {
                    ...dataSource,
                    name: e.target.value,
                  })
                }
              />
              {/* Similar inputs for model, prompt, and active */}
              <button
                onClick={() =>
                  handleUpdateDataSource(dataSource.id, {
                    ...dataSource,
                    active: !dataSource.active,
                  })
                }
              >
                {dataSource.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      </Box>
    </Layout>
  );
};

export default AdminDataSources;
