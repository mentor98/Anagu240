import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ANAGU! — Blockchain Land Administration",
  description:
    "Secure. Transparent. Trusted. Blockchain-GIS-NFT-Community Verification Oracle framework for land title registration and verification under Nigeria's Land Use Act.",
  keywords: ["land title", "blockchain", "Nigeria", "GIS", "NFT", "land registry"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.className} antialiased`} style={{ background: "var(--bg-midnight)", color: "var(--text-primary)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
