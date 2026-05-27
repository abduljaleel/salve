import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "Salve — Self-healing infrastructure via commit-level regression tracing.";
const DESCRIPTION = "When prod breaks, Salve traces the bad commit and rolls back.";
const SITE_URL = "https://salve-akventurecorp.vercel.app";

export const metadata: Metadata = {
  title: { default: TITLE, template: "%s · Salve" },
  description: DESCRIPTION,
  applicationName: "Salve",
  generator: "Next.js",
  keywords: [
    "Salve",
    "salve.dk",
    "Copenhagen",
    "AI agents",
    "agent infrastructure",
    "Aletheia",
    "autonomous agents",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Salve",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
  other: {
    "aletheia:stack": "Part of the Aletheia stack",
    "aletheia:city": "Copenhagen",
    "aletheia:country": "Denmark",
  },
};

export const viewport: Viewport = {
  themeColor: "#e06080",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Salve",
  description: DESCRIPTION,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  publisher: {
    "@type": "Organization",
    name: "Aletheia",
    url: "https://abduljaleel.xyz/aletheia",
  },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
