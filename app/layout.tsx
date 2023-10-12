"use client";
import Nav from "@/components/nav";
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalContextProvider } from "@/context/globalContext";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>SD-JWT VC Demo for GX Credentials</title>
      </head>
      <body className={inter.className}>
        <GlobalContextProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Nav />
              {children}
              <Toaster />
              <Footer />
            </ThemeProvider>
          </QueryClientProvider>
        </GlobalContextProvider>
      </body>
    </html>
  );
}
