import React, { useState } from "react";
import { DentistCard } from "../components/DentistCard";
import { searchDentists } from "./api/places";
import { SearchForm } from "../components/SearchForm";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import { Box, Heading, Button, Flex } from "@chakra-ui/react";
import { saveAs } from "file-saver"; // For downloading the CSV
import { DentistResult } from "../types/types";

const Home: React.FC = () => {
  const [city, setCity] = useState<string>("");
  const [type, setType] = useState("dentists");
  const [results, setResults] = useState<DentistResult[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [showNegativeOnly, setShowNegativeOnly] = useState(false);

  const toggleFilter = () => {
    setShowNegativeOnly((prev) => !prev);
  };

  const filteredResults = showNegativeOnly
    ? results.filter((result) => result.negativeReviews?.length > 0)
    : results;

  const { isLoading, refetch } = useQuery({
    queryKey: ["dentists", city, type],
    queryFn: async (context) => {
      const searchCity = context.queryKey[1] as string; // Access the passed city
      const searchType = context.queryKey[2] as string; // Access the passed type
      const data = await searchDentists(searchCity, searchType);
      setResults(data.results);
      setNextPageToken(data.nextPageToken);
      return data;
    },
    enabled: false, // Disable automatic query execution
  });

  const fetchDentists = async (searchCity: string, searchType: string) => {
    const data = await searchDentists(searchCity, searchType);
    setResults(data.results);
    setNextPageToken(data.nextPageToken);
    return data;
  };

  const handleSearch = async (searchCity: string, searchType: string) => {
    if (!searchCity.trim()) {
      console.error("City is required to perform a search");
      return;
    }

    console.log("City:", searchCity);
    console.log("Type:", searchType);

    setCity(searchCity);
    setType(searchType);
    setResults([]);
    await fetchDentists(searchCity, searchType); // Fetch directly
  };

  const loadMore = async () => {
    if (nextPageToken) {
      const data = await searchDentists(city, type, nextPageToken);
      setResults((prev) => [...prev, ...data.results]);
      setNextPageToken(data.nextPageToken);
    }
  };

  const exportToCSV = () => {
    const csvRows: string[][] = []; // Explicitly define as a 2D string array

    // Define the header
    const header: string[] = [
      "Google Business Name",
      "Reviews Link",
      "# Negative Reviews",
      ...Array.from({ length: 10 }, (_, i) => [
        `Negative Review #${i + 1} Copy`,
        `Negative Review #${i + 1} Name`,
        `Negative Review #${i + 1} Date`,
        `Negative Review #${i + 1} Url`,
      ]).flat(),
    ];

    csvRows.push(header); // Add the header as the first row

    // Process each dentist and create rows
    filteredResults.forEach((dentist) => {
      // Start with the main columns
      const row: string[] = [
        dentist.name,
        `https://www.google.com/maps/place/?q=place_id:${dentist.placeId}`,
        dentist.negativeReviews.length.toString(), // Ensure this is a string
      ];

      // Add up to 10 negative reviews
      dentist.negativeReviews.slice(0, 10).forEach((review) => {
        row.push(
          review.text || "", // Review copy
          review.author_name || "", // Reviewer's name
          review.relative_time_description || "", // Date of the review
          review.author_url || "" // Profile URL
        );
      });

      // Fill remaining columns with empty strings if there are fewer than 10 reviews
      const maxReviewFields = 10 * 4; // 10 reviews, 4 fields each
      const filledFields = dentist.negativeReviews.slice(0, 10).length * 4;
      const emptyFields = maxReviewFields - filledFields;

      for (let i = 0; i < emptyFields; i++) {
        row.push("");
      }

      csvRows.push(row); // Add the row to the CSV data
    });

    // Convert the rows into a CSV string
    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    // Create a downloadable Blob and save the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${type}_reviews.csv`);
  };

  return (
    <Box maxW="2xl" mx="auto" py="12" px="6">
      <Heading as="h2" size="xl" textAlign="center" mb={6}>
        Bad RX
      </Heading>
      <div className="max-w-6xl mx-auto">
        <Heading as="h3" textAlign="center" mb={6}>
          The unpleasant truths revealed in reviews
        </Heading>
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            <Flex justifyContent="center" mb={4}>
              <Button onClick={toggleFilter} colorScheme="blue">
                {showNegativeOnly
                  ? "Show All Results"
                  : "Show Results with Negative Reviews"}
              </Button>
            </Flex>

            <Flex justifyContent="center" mt={8}>
              <Button onClick={exportToCSV} colorScheme="green" size="md">
                Export to CSV
              </Button>
            </Flex>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((dentist, index) => (
                <DentistCard
                  key={`${dentist.placeId}-${index}`}
                  dentist={dentist}
                />
              ))}
            </div>

            {nextPageToken && (
              <div className="mt-8 text-center">
                <Button
                  onClick={loadMore}
                  colorScheme="blue"
                  size="md"
                  borderRadius="md"
                  _hover={{ bg: "blue.600" }}
                >
                  Load More Results
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Box>
  );
};

export default Home;
