import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tomas Couto — Senior Graphic Designer / Art Director",
  description:
    "Premium social-first design systems blending performance marketing, editorial aesthetics, motion, and creator-commerce storytelling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
