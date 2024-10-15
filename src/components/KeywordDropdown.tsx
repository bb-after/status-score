import { useEffect, useState } from "react";
import { Select, Spinner, Box } from "@chakra-ui/react";
import axios from "axios";

type Keyword = {
  id: number;
  name: string;
};

interface KeywordDropdownProps {
  onSelectKeyword: (id: number, name: string) => void;
}

const KeywordDropdown = ({ onSelectKeyword }: KeywordDropdownProps) => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  useEffect(() => {
    // Fetch the list of keywords from the backend
    async function fetchKeywords() {
      try {
        const response = await axios.get("/api/keywords");
        console.log("Fetched keywords:", response.data);

        // Ensure all keywords have valid data, or log them if they don't
        const validKeywords = response.data.filter(
          (keyword: Keyword) => keyword.id !== undefined && keyword.name
        );

        setKeywords(validKeywords);
      } catch (error) {
        console.error("Failed to fetch keywords", error);
      } finally {
        setLoading(false);
      }
    }

    fetchKeywords();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKeywordId = parseInt(e.target.value, 10);
    const selectedKeyword = keywords.find(
      (keyword) => keyword.id === selectedKeywordId
    );

    if (selectedKeyword) {
      // Call the callback with both ID and name
      onSelectKeyword(selectedKeyword.id, selectedKeyword.name);
    }
  };

  return (
    <>
      {loading ? (
        <Box textAlign="center" py={4}>
          <Spinner size="lg" />
        </Box>
      ) : (
        <Select
          placeholder="Select a keyword"
          onChange={handleChange}
          value={keywords.length ? undefined : ""}
        >
          {keywords.length > 0 ? (
            keywords.map((keyword) => (
              <option key={keyword.id} value={keyword.id}>
                {keyword.name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No keywords available
            </option>
          )}
        </Select>
      )}
    </>
  );
};

export default KeywordDropdown;
