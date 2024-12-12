// pages/add-keyword.tsx
import { Box, Heading, Text } from "@chakra-ui/react";
import AddKeywordForm from "../components/AddKeywordForm";

const AddKeywordPage = () => {
  return (
    <Box maxW="2xl" mx="auto" py="12" px="6">
      <Heading as="h2" size="xl" textAlign="center" mb={6}>
        Add a New Keyword
      </Heading>
      <Text textAlign="center" color="gray.600" mb={8}>
        Enter a new keyword that you would like to track. We will monitor its
        sentiment and provide detailed reports.
      </Text>
      <AddKeywordForm />
    </Box>
  );
};

export default AddKeywordPage;
