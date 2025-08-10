import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/components/providers/auth-provider'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GravityPlay - The Ultimate Marble Run Platform",
  description: "The definitive catalog and community for marble run enthusiasts. Discover, build, and share incredible marble run creations.",
  keywords: ["marble run", "gravitrax", "marble genius", "hubelino", "quadrilla", "marble track", "building toys"],
  authors: [{ name: "GravityPlay Team" }],
  creator: "GravityPlay",
  publisher: "GravityPlay",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
