import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { render } from '../../test-utils';
import Layout from '../Layout';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
}));

describe('Layout', () => {
  const mockChildren = <div data-testid="mock-children">Test Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children and logo', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: null });

    render(<Layout>{mockChildren}</Layout>);

    // Check if logo is rendered
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    
    // Check if children are rendered
    expect(screen.getByTestId('mock-children')).toBeInTheDocument();

    // Wait for the user fetch to complete
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/me', {
        withCredentials: true,
      });
    });
  });

  it('displays login button when not logged in', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: null });

    render(<Layout>{mockChildren}</Layout>);

    await waitFor(() => {
      expect(screen.getByText(/login/i)).toBeInTheDocument();
    });
  });

  it('displays user email and logout when logged in', async () => {
    const mockUser = { email: 'test@example.com' };
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    render(<Layout>{mockChildren}</Layout>);

    await waitFor(() => {
      // Look for the welcome text that contains the email
      const welcomeText = screen.getAllByText(/test@example\.com/i)[0];
      expect(welcomeText).toBeInTheDocument();
      
      // Look for logout link
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });
  });

  it('handles failed user fetch gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<Layout>{mockChildren}</Layout>);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('toggles mobile menu when hamburger icon is clicked', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: null });

    render(<Layout>{mockChildren}</Layout>);

    // Find and click hamburger menu button
    const menuButton = screen.getByLabelText(/open menu/i);
    fireEvent.click(menuButton);

    // Check if menu is visible
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Click again to close
    fireEvent.click(menuButton);

    // Menu should be hidden
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
