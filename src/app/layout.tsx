import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FocusBloom - Personal Deep Work Tracker",
  description: "A B2C focus companion to run deep-work sessions, reduce distractions, and build a healthier productivity routine.",
  keywords: ["focus", "productivity", "deep work", "time tracking", "habit building"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/dashboard-neural-bg.svg"
          as="image"
          type="image/svg+xml"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} app-neural-background antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
