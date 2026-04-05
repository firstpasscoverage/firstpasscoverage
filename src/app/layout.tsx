import type { Metadata } from "next";
import { Libre_Baskerville, Geist } from "next/font/google";
import Script from "next/script";
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
      <head>
        {/* Google Ads (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18064677272"
          strategy="afterInteractive"
        />
        <Script id="google-ads-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18064677272');
          `}
        </Script>
        {/* Reddit Pixel */}
        <Script id="reddit-pixel" strategy="afterInteractive">
          {`
            !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js";t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
            rdt('init','a2_isfw2zi84zjo');
            rdt('track', 'PageVisit');
          `}
        </Script>
      </head>
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
