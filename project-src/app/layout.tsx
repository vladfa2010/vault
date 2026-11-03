import { Providers } from "@/components/providers";
import { SkipToContent } from "@/components/skip-to-content";
import { ThemeSwitch } from "@/components/theme-switch";
import { baseMetadata } from "@/lib/metadata";
import type { Metadata, Viewport } from "next";
import { Roboto_Condensed } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

// CIFRA brand fonts (from cifra.com): Hauss for text/UI, Gravity for display.
const hauss = localFont({
  variable: "--font-hauss",
  src: [
    { path: "./fonts/Hauss-Regular.woff", weight: "400", style: "normal" },
    { path: "./fonts/Hauss-Medium.woff", weight: "500", style: "normal" },
  ],
  display: "swap",
});

const gravity = localFont({
  variable: "--font-gravity",
  src: "./fonts/Gravity-Condensed.woff",
  weight: "900",
  style: "normal",
  display: "swap",
});

// Cyrillic display substitute for Gravity (Gravity has Latin-only glyphs);
// Barlow Condensed 900 matches the condensed heavy uppercase CIFRA look.
const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin", "cyrillic"],
  weight: "900",
  display: "swap",
});

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactNode {
  return (
    <html
      lang="ru"
      className={`${hauss.variable} ${gravity.variable} ${robotoCondensed.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          <SkipToContent />
          {children}
          <ThemeSwitch />
        </Providers>
      </body>
    </html>
  );
}
