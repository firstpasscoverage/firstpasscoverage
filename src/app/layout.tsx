import type { Metadata } from "next";
import { Libre_Baskerville, Geist } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { cn } from "@/lib/utils";
import { PostHogProvider } from './posthog-provider'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre",
  display: "swap",
});

export const metadata: Metadata = {
  title: "First Pass Coverage — Professional Screenplay Coverage",
  description:
    "Upload your screenplay and get detailed, professional coverage in under three minutes. Premise, structure, character, dialogue, and seven more rated categories with a clear recommendation.",
  openGraph: {
    title: "First Pass Coverage",
    description: "Professional screenplay coverage in under three minutes.",
    url: "https://firstpasscoverage.com",
    siteName: "First Pass Coverage",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, libre.variable)}>
      <body className="antialiased">
      <ClerkProvider>
  <PostHogProvider>
    <Nav />
    <main className="min-h-[calc(100vh-140px)]">{children}</main>
    <Footer />
  </PostHogProvider>
</ClerkProvider>
      </body>
    </html>
  );
}
