import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL(process.env.BETTER_AUTH_URL || "http://localhost:3000"),
  title: "UniOrario",
  applicationName: "UniOrario",
  description:
    "Orario lezioni dell'Università dell'Insubria, sempre a portata di mano",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "UniOrario",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f7" },
    { media: "(prefers-color-scheme: dark)", color: "#090909" },
  ],
};

const themeScript = `
  (function() {
    var theme = null;
    try { theme = localStorage.getItem('theme'); } catch (e) {}
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
      <body className={`${onest.variable} font-sans antialiased bg-background`}>
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
