import React, { useState, useEffect, useRef } from 'react';
import { Box, Input, Button, Select } from '@chakra-ui/react';

interface SearchFormProps {
  onSearch: (city: string, type: string) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [city, setCity] = useState('');
  const [type, setType] = useState('dentists');

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (inputRef.current?.value.trim()) {
      // Only call onSearch if the city is not empty
      onSearch(inputRef.current.value.trim(), type);
    } else {
      console.error('City is required to perform a search');
    }
  };

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
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
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['(cities)'], // Restrict to cities
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.formatted_address) {
            setCity(place.formatted_address); // Set the city in the state
            onSearch(place.formatted_address, type); // Trigger search
          }
        });
      }
    };

    loadGoogleMapsScript();

    return () => {
      autocompleteRef.current?.unbindAll();
    };
  }, [onSearch]);

  return (
    <Box as="form" mb={8} onSubmit={(e) => e.preventDefault()}>
      <Input
        ref={inputRef}
        placeholder="Enter city or state"
        size="lg"
        mb={4}
        disabled={isLoading}
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
        onClick={handleSearch} // Ensure validation here
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
