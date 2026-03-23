import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre",
  display: "swap",
});

export const metadata: Metadata = {
  title: "First Pass Coverage — Professional Screenplay Coverage",
  description:
    "Upload your screenplay and get detailed, professional coverage in under three minutes. Premise, structure, character, dialogue, and seven more scored categories with a clear recommendation.",
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
    <html lang="en" className={libre.variable}>
      <body className="bg-[#fafafa] text-[#111] antialiased">
        <Nav />
        <main className="min-h-[calc(100vh-140px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
