import '@testing-library/jest-dom'

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
    }
  },
}))

// Mock window.google.maps
const mockGoogle = {
  maps: {
    places: {
      Autocomplete: jest.fn().mockImplementation(() => ({
        addListener: jest.fn(),
        getPlace: jest.fn().mockReturnValue({ formatted_address: 'Test City' }),
      })),
    },
  },
}

global.google = mockGoogle

// Mock axios
jest.mock('axios')

// Suppress console errors during tests
console.error = jest.fn()
