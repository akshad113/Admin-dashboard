import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

import StoreBootstrap from "../components/StoreBootstrap";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shoplane Customer Store",
  description: "Customer storefront for products, cart, and orders.",
};

// Render the root layout and provide the shared customer bootstrap.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body className="min-h-screen font-sans text-slate-900 antialiased">
        <StoreBootstrap />
        {children}
      </body>
    </html>
  );
}
