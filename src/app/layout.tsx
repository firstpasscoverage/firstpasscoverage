import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Screenplay Coverage Tool",
  description: "AI-powered screenplay analysis and coverage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
