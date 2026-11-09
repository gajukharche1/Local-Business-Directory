import type { Metadata } from "next";
import { SkipLink } from "@/components/ui/skip-link";
import "./globals.css";

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const safeAppUrl = rawAppUrl.startsWith("http://") || rawAppUrl.startsWith("https://")
  ? rawAppUrl
  : `https://${rawAppUrl}`;

export const metadata: Metadata = {
  title: "Local Business Directory | Find Top Services Nearby",
  description:
    "Discover verified local businesses, restaurants, healthcare, clinics, and professional services across Pimple Saudagar, PCMC, Pune.",
  metadataBase: new URL(safeAppUrl),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background font-sans antialiased selection:bg-primary/20"
        suppressHydrationWarning
      >
        <SkipLink />
        <div id="main-content" tabIndex={-1} className="focus:outline-none">
          {children}
        </div>
      </body>
    </html>
  );
}
