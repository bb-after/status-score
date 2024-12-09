import { useEffect, useState } from "react";
import { Select, Spinner, Box } from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

type Keyword = {
  id: number;
  name: string;
};

interface KeywordDropdownProps {
  onSelectKeyword: (id: number, name: string) => void;
  defaultValue?: number | null;
  loadingText?: string; // Added loading text prop
}

const KeywordDropdown = ({
  onSelectKeyword,
  defaultValue,
  loadingText = "Loading keywords...",
}: KeywordDropdownProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [setIsLoading] = useState(isLoading);

  useEffect(() => {
    if (isAuthenticated) {
      async function fetchKeywords() {
        try {
          const response = await axios.get("/api/keywords");
          console.log("Fetched keywords:", response.data);

          const validKeywords = response.data.filter(
            (keyword: Keyword) => keyword.id !== undefined && keyword.name
          );

          setKeywords(validKeywords);
        } catch (error) {
          console.error("Failed to fetch keywords", error);
        } finally {
          // setIsLoading = false;
        }
      }

      fetchKeywords();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (defaultValue && keywords.length > 0) {
      const defaultKeyword = keywords.find(
        (keyword) => keyword.id === defaultValue
      );
      if (defaultKeyword) {
        onSelectKeyword(defaultKeyword.id, defaultKeyword.name);
      }
    }
  }, [defaultValue, keywords, onSelectKeyword]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKeywordId = parseInt(e.target.value, 10);
    const selectedKeyword = keywords.find(
      (keyword) => keyword.id === selectedKeywordId
    );

    if (selectedKeyword) {
      onSelectKeyword(selectedKeyword.id, selectedKeyword.name);
    }
  };

  return (
    <>
      {isLoading ? (
        <Box textAlign="center" py={4}>
          <Spinner size="lg" />
          {loadingText && <p>{loadingText}</p>}{" "}
          {/* Display loading text if provided */}
        </Box>
      ) : (
        <Select
          placeholder="Select a keyword"
          onChange={handleChange}
          value={defaultValue || undefined}
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
