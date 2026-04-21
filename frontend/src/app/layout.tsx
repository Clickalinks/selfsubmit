import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/app/providers";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SelfSubmit — Simple tax returns for the self-employed",
  description:
    "UK self-employed monthly submissions, PDFs, and your accountant — built for taxi drivers, barbers, driving instructors, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en-GB" className={inter.variable}>
        <body className="min-h-screen font-sans antialiased">{children}</body>
      </html>
    </Providers>
  );
}
