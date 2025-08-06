import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Syntra AI Agentic Assistant - Advanced AI with Real-time Tools",
    template: "%s | Syntra AI"
  },
  description: "Syntra is an advanced AI assistant powered by Claude 3.5 Sonnet with access to real-time tools including Wikipedia search, YouTube transcripts, Google Books, mathematical calculations, currency conversion, and more. Built with Next.js 15, Convex, Clerk, and LangGraph.",
  keywords: [
    "AI assistant",
    "artificial intelligence",
    "chatbot",
    "Claude 3.5",
    "LangGraph",
    "Next.js",
    "Convex",
    "real-time tools",
    "Wikipedia search",
    "YouTube transcripts",
    "Google Books",
    "mathematical calculations",
    "currency conversion",
    "IBM Wxtools"
  ],
  authors: [{ name: "Syntra AI Team" }],
  creator: "Syntra AI",
  publisher: "Syntra AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://syntra-ai.vercel.app"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },
  openGraph: {
    title: "Syntra AI Agentic Assistant",
    description: "Advanced AI assistant with real-time tools and current data access. Powered by Claude 3.5 Sonnet and IBM Wxtools.",
    url: "https://syntra-ai.vercel.app",
    siteName: "Syntra AI",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Syntra AI Agentic Assistant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syntra AI Agentic Assistant",
    description: "Advanced AI assistant with real-time tools and current data access.",
    images: ["/logo.png"],
    creator: "@syntra_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <html lang="en">
        <head>
          {/* Favicon and Tab Icons */}
          <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
          <link rel="shortcut icon" href="/logo.png" />
          <link rel="manifest" href="/manifest.json" />
          
          {/* Theme and Viewport */}
          <meta name="theme-color" content="#000000" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          
          {/* Additional Meta Tags */}
          <meta name="msapplication-TileColor" content="#000000" />
          <meta name="msapplication-TileImage" content="/logo.png" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ConvexClientProvider>
  );
}
