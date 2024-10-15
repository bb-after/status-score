import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Heading,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import Loader from "../components/Loader"; // Reusing the Loader component

// Define an interface for the data source object
interface DataSource {
  id: number;
  name: string;
  model: string;
  prompt: string;
  active: boolean;
}

const AddKeywordForm = () => {
  const [keyword, setKeyword] = useState("");
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch available data sources when the component mounts
  useEffect(() => {
    const fetchDataSources = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/datasources");
        const activeDataSources = response.data.filter(
          (source: DataSource) => source.active
        );
        setDataSources(activeDataSources);
      } catch (error) {
        console.error("Failed to fetch data sources", error);
        setError("Failed to fetch data sources. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDataSources();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!keyword || !selectedDataSourceId) {
      alert("Please enter a keyword and select a data source.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Send POST request to backend to add the keyword and trigger sentiment analysis
      await axios.post("/api/keywords/add", {
        keyword,
        aiEngine: dataSources.find(
          (ds) => ds.id === Number(selectedDataSourceId)
        )?.name,
        dataSourceId: selectedDataSourceId,
      });

      // Redirect or reset after successful submission
      setKeyword("");
      setSelectedDataSourceId("");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to add keyword", error);
      setError("Failed to add keyword. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box maxW="2xl" mx="auto" py="12" px="6">
      <Heading as="h2" size="xl" textAlign="center" mb={6}>
        Add Keyword for Sentiment Analysis
      </Heading>

      {/* Show loader while fetching data sources */}
      {loading && <Loader />}

      {/* Show error if it exists */}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && (
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

          <FormControl id="dataSource" mb={4}>
            <FormLabel>Select AI Engine</FormLabel>
            <Select
              placeholder="Select an AI engine"
              value={selectedDataSourceId}
              onChange={(e) => setSelectedDataSourceId(e.target.value)}
            >
              {dataSources.map((dataSource) => (
                <option key={dataSource.id} value={dataSource.id}>
                  {dataSource.name} - Model: {dataSource.model}
                </option>
              ))}
            </Select>
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
