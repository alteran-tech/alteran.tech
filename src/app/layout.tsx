import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const alteranFont = localFont({
  src: "../../public/fonts/alteran.ttf",
  variable: "--font-alteran-face",
  display: "swap",
  weight: "400",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050510",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alteran.tech";

export const metadata: Metadata = {
  title: {
    default: "alteran.tech — Software Development Company",
    template: "%s | alteran.tech",
  },
  description:
    "Alteran — software development company building performant, elegant products. Our portfolio of projects, experiments, and technology solutions.",
  keywords: [
    "Alteran",
    "portfolio",
    "software company",
    "full-stack development",
    "TypeScript",
    "React",
    "Next.js",
    "web development",
  ],
  authors: [{ name: "Alteran", url: siteUrl }],
  creator: "Alteran",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "alteran.tech",
    title: "alteran.tech — Software Development Company",
    description:
      "Alteran — software development company building performant, elegant products.",
  },
  twitter: {
    card: "summary_large_image",
    title: "alteran.tech — Alteran",
    description:
      "Alteran — software development company building performant, elegant products.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${alteranFont.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-ancient-bg min-h-screen antialiased">
        {/* Skip navigation link -- visually hidden, shown on focus */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-ancient-teal focus:text-ancient-bg focus:font-semibold focus:text-sm focus:outline-none focus:shadow-[0_0_20px_rgba(113,215,180,0.5)]"
        >
          Skip to main content
        </a>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
