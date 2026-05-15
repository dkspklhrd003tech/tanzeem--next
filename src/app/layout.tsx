import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/components/layout";
import Script from "next/script";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Tanzeem-e-Islami",
  description: "Tanzeem-e-Islami is working to re-establish Khilafah by following the methodology of Prophet Muhammad (SAWS). Access Islamic lectures, books, videos, and educational resources.",
  keywords: ["Tanzeem-e-Islami", "Dr. Israr Ahmed", "Islamic Lectures", "Khilafah", "Quran", "Hadith", "Islamic Education", "Islamic Books"],
  authors: [{ name: "Tanzeem-e-Islami" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Tanzeem-e-Islami",
    description: "Access Islamic lectures, books, videos, and educational resources from Tanzeem-e-Islami",
    url: "https://tanzeem.org",
    siteName: "Tanzeem-e-Islami",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tanzeem-e-Islami",
    description: "Working to establish Deen through knowledge and action",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-B6P9KW8X46" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-B6P9KW8X46');
          `}
        </Script>
      </head>
      <body
        className={`${lato.variable} antialiased bg-background text-foreground`}
      >
        <MainLayout>
          {children}
        </MainLayout>
        <Toaster />
      </body>
    </html>
  );
}
