import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import { SearchForm } from '../SearchForm';

// Mock the Google Maps Autocomplete
const mockAddListener = jest.fn();
const mockUnbindAll = jest.fn();
const mockAutocomplete = {
  addListener: mockAddListener,
  unbindAll: mockUnbindAll,
  getPlace: () => ({ formatted_address: 'Test City' }),
};

beforeAll(() => {
  // @ts-ignore
  global.google = {
    maps: {
      places: {
        Autocomplete: jest.fn(() => mockAutocomplete),
      },
    },
  };
});

describe('SearchForm', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
    mockAddListener.mockClear();
    mockUnbindAll.mockClear();
  });

  it('renders search form with input and select', () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onSearch with input values when search button is clicked', async () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
    
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    await userEvent.type(input, 'Test City');
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('Test City', 'dentists');
  });

  it('disables search button when loading', () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('initializes Google Maps autocomplete', async () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
    
    await waitFor(() => {
      expect(google.maps.places.Autocomplete).toHaveBeenCalled();
      expect(mockAddListener).toHaveBeenCalledWith('place_changed', expect.any(Function));
    });
  });

  it('handles place selection from autocomplete', async () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
    
    // Get the callback that was registered
    const placeChangedCallback = mockAddListener.mock.calls[0][1];
    
    // Simulate place selection
    placeChangedCallback();

    expect(mockOnSearch).toHaveBeenCalledWith('Test City', 'dentists');
  });
});
