import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "@/app/globals.css";
import Script from "next/script";
import type React from "react";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { TRPCProvider } from "@/lib/providers";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Orario Universitario",
  description: "App per visualizzare l'orario delle lezioni universitarie",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="light" suppressHydrationWarning>
      <head>
        <Script id="theme-switcher" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body
        className={`${onest.variable} font-sans antialiased bg-white dark:bg-black`}
      >
        <TRPCProvider>
          <ServiceWorkerRegistration />
          <AnalyticsTracker />
          {children}
        </TRPCProvider>
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
