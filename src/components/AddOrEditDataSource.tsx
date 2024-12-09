import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Textarea,
  Checkbox,
  Button,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";

interface AddOrEditDataSourceProps {
  dataSourceId?: string | null; // Update the type definition
}

const AddOrEditDataSource = ({
  dataSourceId = null,
}: AddOrEditDataSourceProps) => {
  const router = useRouter();
  const [dataSource, setDataSource] = useState({
    name: "",
    model: "",
    prompt: "",
    active: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchDataSource = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/datasources/${dataSourceId}`);
      setDataSource(response.data);
    } catch (error) {
      console.error("Failed to fetch data source", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dataSourceId) {
      fetchDataSource();
    }
  }, [dataSourceId, fetchDataSource]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (dataSourceId) {
        // Update existing data source
        await axios.put(`/api/datasources/${dataSourceId}`, dataSource);
      } else {
        // Create a new data source
        await axios.post("/api/datasources", dataSource);
      }
      router.push("/admin/data-sources");
    } catch (error) {
      console.error("Failed to save data source", error);
    }
  };

  return (
    <Box maxW="2xl" mx="auto" py="12" px="6">
      <Heading as="h2" size="xl" textAlign="center" mb={6}>
        {dataSourceId ? "Edit Data Source" : "Add New Data Source"}
      </Heading>
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
        <FormControl id="datasource" mb={4}>
          <FormLabel>Data Source Name</FormLabel>
          <Input
            type="text"
            placeholder="Eg. OpenAI"
            value={dataSource.name}
            onChange={(e) =>
              setDataSource({ ...dataSource, name: e.target.value })
            }
            isDisabled={isLoading}
          />
        </FormControl>
        <FormControl id="model" mb={4}>
          <FormLabel>Model Name</FormLabel>
          <Input
            type="text"
            placeholder="text-davinci-003"
            value={dataSource.model}
            onChange={(e) =>
              setDataSource({ ...dataSource, model: e.target.value })
            }
            isDisabled={isLoading}
          />
        </FormControl>
        <FormControl id="prompt" mb={4}>
          <FormLabel>Prompt</FormLabel>
          <Textarea
            placeholder="Eg. Analyze the sentiment of the following content:"
            value={dataSource.prompt}
            onChange={(e) =>
              setDataSource({ ...dataSource, prompt: e.target.value })
            }
            isDisabled={isLoading}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Active</FormLabel>
          <Checkbox
            isChecked={dataSource.active}
            onChange={(e) =>
              setDataSource({ ...dataSource, active: e.target.checked })
            }
            isDisabled={isLoading}
          />
        </FormControl>
        <Button
          type="submit"
          colorScheme="teal"
          width="full"
          mt={4}
          isDisabled={isLoading}
        >
          {dataSourceId ? "Update Data Source" : "Create Data Source"}
        </Button>
      </Box>
    </Box>
  );
};

export default AddOrEditDataSource;
