import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "../contexts/AuthContext";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import theme from "../theme/theme";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <ChakraProvider theme={theme}>
        <AuthProvider
          value={{ isAuthenticated: false, isLoading: true, user: null }}
        >
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
          </QueryClientProvider>
        </AuthProvider>
      </ChakraProvider>
    </UserProvider>
  );
}

export default MyApp;
