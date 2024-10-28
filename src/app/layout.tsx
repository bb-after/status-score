// src/app/layout.tsx
"use client";

import { UserProvider } from "@auth0/nextjs-auth0/client";
import { ChakraProvider } from "@chakra-ui/react";
import Layout from "../components/Layout";
import "../styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <UserProvider>
            <Layout>{children}</Layout>
          </UserProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
