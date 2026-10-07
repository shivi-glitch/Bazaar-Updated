import type { Metadata } from "next";
import "./globals.css";
import { WebSocketProvider } from "../components/layout/WebSocketProvider";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata: Metadata = {
  title: "MERX | Meridian Exchange",
  description: "The Ultimate Algorithmic Trading Simulation",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider defaultTheme="dark">
          <WebSocketProvider>{children}</WebSocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}