import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  title: "Tomas Couto — Senior Graphic Designer & Art Director",
  description:
    "Premium social-first design systems blending performance marketing, editorial aesthetics, motion, and creator-commerce storytelling. Available for freelance.",
  keywords: [
    "graphic designer",
    "art director",
    "social media design",
    "performance creative",
    "branding",
    "motion design",
    "paid social",
    "UGC creative",
    "TikTok design",
    "Tomas Couto",
  ],
  authors: [{ name: "Tomas Couto" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tomascouto.com",
    siteName: "Tomas Couto Portfolio",
    title: "Tomas Couto — Senior Graphic Designer & Art Director",
    description:
      "Designing high-performing creative for modern brands. Premium social-first design systems blending performance marketing and editorial aesthetics.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tomas Couto — Senior Graphic Designer & Art Director",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tomas Couto — Senior Graphic Designer & Art Director",
    description:
      "Designing high-performing creative for modern brands.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://tomascouto.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
