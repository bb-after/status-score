// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client"; // Note: Using the `/client` version

import Link from "next/link";
import { Box, Button, Image } from "@chakra-ui/react";

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // If user is logged in, redirect to dashboard
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Box>
          <Image
            src="https://status-score-public.s3.us-east-2.amazonaws.com/logo-1.png"
            alt="Logo"
            width={180}
          />
        </Box>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">Track your status in real(er) time.</li>
          <li>Schedule for future updates.</li>
          <li>Rinse and repeat.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link href="/api/auth/login" passHref>
            <Button colorScheme="teal">Log In</Button>
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {/* Footer links go here */}
      </footer>
    </div>
  );
}
