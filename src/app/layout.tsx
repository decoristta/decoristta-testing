import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

import Footer from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Decoristta | Premium Home Decor",
  description: "Style Your Story. Explore our stunning collection of considered furniture, luxury lights, sculptural vases, and classic antiques for calm, warm interiors.",
  keywords: ["luxury home decor", "premium furniture", "interior design", "antique showpieces", "modern vases", "Decoristta", "home styling"],
  openGraph: {
    title: "Decoristta | Premium Home Decor",
    description: "Style Your Story. Explore our stunning collection of considered furniture and decor for calm, warm interiors.",
    url: "https://decoristta-source-code.vercel.app",
    siteName: "Decoristta",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Decoristta | Premium Home Decor",
    description: "Style Your Story. Explore our stunning collection of considered furniture and decor for calm, warm interiors.",
  },
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
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable}`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
