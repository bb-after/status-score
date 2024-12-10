import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "@chakra-ui/theme";
import { AuthProvider } from "../contexts/AuthContext";
import localFont from "next/font/local";
import "../styles/globals.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  preload: true,
});

const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  preload: true,
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/auth/me", {
          withCredentials: true,
        });
        setAuthState({
          isAuthenticated: response.data.isAuthenticated,
          isLoading: false,
          user: response.data,
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    };
    checkAuth();
  }, []);

  return (
    <UserProvider>
      <ChakraProvider theme={theme} resetCSS={false}>
        <AuthProvider value={authState}>
          <QueryClientProvider client={queryClient}>
            <div className={`${geistSans.variable} ${geistMono.variable}`}>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </div>
          </QueryClientProvider>
        </AuthProvider>
      </ChakraProvider>
    </UserProvider>
  );
}

export default MyApp;
