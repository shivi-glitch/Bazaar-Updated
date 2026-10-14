import type { Metadata } from "next";
import "./globals.css";
import { WebSocketProvider } from "../components/layout/WebSocketProvider";
import { ThemeProvider } from "../components/ThemeProvider";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "EIC X Bazaar",
  description: "EIC X Bazaar · University Edition. A live stock market simulation where every headline moves prices.",
  openGraph: {
    title: "EIC X Bazaar",
    description: "A live stock market simulation where every headline moves prices.",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "EIC X Bazaar",
    description: "A live stock market simulation where every headline moves prices.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/geist-font/Geist/webfonts/Geist[wght].woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/geist-font/GeistMono/webfonts/GeistMono[wght].woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Haskoy-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-[100dvh] flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-bg-raised focus:text-tx-primary">
          Skip to content
        </a>
        <ThemeProvider defaultTheme="dark">
          <WebSocketProvider>{children}</WebSocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}