import type { Metadata } from "next";
import { Inter_Tight, Noto_Serif } from "next/font/google";
import "@/app/globals.css";
import type React from "react";
import { TRPCProvider } from "@/lib/providers";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Orario Universitario",
  description: "App per visualizzare l'orario delle lezioni universitarie",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interTight.variable} ${notoSerif.variable} font-sans antialiased`}
      >
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
