import {
  Box,
  Heading,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../../components/Layout";
interface DataSource {
  id: number;
  name: string;
  model: string;
  prompt: string;
  active: boolean;
  weight: number;
}

const AdminDataSources = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/datasources");
      setDataSources(response.data);
    } catch (error) {
      console.error("Failed to fetch data sources", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeightChange = (id: number, weight: number) => {
    setDataSources((prev) =>
      prev.map((dataSource) =>
        dataSource.id === id ? { ...dataSource, weight } : dataSource
      )
    );
  };

  const handleSaveWeight = async (id, weight) => {
    try {
      await axios.put(`/api/datasources/${id}`, { weight: parseFloat(weight) });
      fetchDataSources();
    } catch (error) {
      console.error("Failed to update weight", error);
    }
  };

  return (
    <Box maxW="2xl" mx="auto" py="12" px="6">
      <Heading as="h2" size="xl" textAlign="center" mb={6}>
        Admin: Manage Data Source Weights
      </Heading>

      <Table variant="striped" colorScheme="gray">
        <Tbody>
          {dataSources.map((source) => (
            <Tr key={source.id}>
              <Td>{source.name}</Td>
              <Td>
                <Input
                  type="number"
                  step="0.1"
                  value={source.weight}
                  onChange={(e) =>
                    handleWeightChange(source.id, parseFloat(e.target.value))
                  }
                  width="100px"
                  mr={4}
                />
                <Button
                  colorScheme="teal"
                  onClick={() => handleSaveWeight(source.id, source.weight)}
                  isDisabled={isLoading}
                >
                  Save
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AdminDataSources;
