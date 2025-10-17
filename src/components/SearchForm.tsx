import React, { useState, useEffect, useRef } from "react";
import { Box, Input, Button, Select } from "@chakra-ui/react";

interface SearchFormProps {
  onSearch: (city: string, type: string) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  isLoading,
}) => {
  const [city, setCity] = useState("");
  const [type, setType] = useState("dentists");
  const typeRef = useRef(type);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update ref when type changes
  typeRef.current = type;

  const handleSearch = () => {
    const searchCity = city || inputRef.current?.value.trim();
    if (searchCity) {
      onSearch(searchCity, type);
    } else {
      console.error("City is required to perform a search");
    }
  };

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeAutocomplete;
        document.body.appendChild(script);
      } else {
        initializeAutocomplete();
      }
    };

    const initializeAutocomplete = () => {
      if (window.google && inputRef.current) {
        autocompleteRef.current = new google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["(cities)"],
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.formatted_address) {
            setCity(place.formatted_address);
            if (inputRef.current) {
              inputRef.current.value = place.formatted_address;
            }
            // Don't trigger search automatically - let user click search button
          }
        });
      }
    };

    loadGoogleMapsScript();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onSearch]); // Only re-run if onSearch changes

  return (
    <Box as="form" mb={8} onSubmit={(e) => e.preventDefault()}>
      <Input
        ref={inputRef}
        placeholder="Enter city or state"
        size="lg"
        mb={4}
        disabled={isLoading}
        onChange={(e) => setCity(e.target.value)}
        value={city}
      />
      <Select
        value={type}
        onChange={(e) => setType(e.target.value)}
        size="lg"
        mb={4}
        isDisabled={isLoading}
      >
        <option value="dentists">Dentists</option>
        <option value="doctors">Doctors</option>
        <option value="lawyers">Lawyers</option>
      </Select>
      <Button
        onClick={handleSearch}
        isLoading={isLoading}
        colorScheme="blue"
        size="lg"
        width="full"
      >
        Search
      </Button>
    </Box>
  );
};
