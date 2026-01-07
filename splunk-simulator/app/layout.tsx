import type { Metadata } from "next";
import "./globals.css";
import { SplunkProvider } from "@/lib/context/splunk-context";

export const metadata: Metadata = {
  title: "Splunk Training Simulator - Enterprise Edition",
  description: "Learn Splunk SPL queries with realistic enterprise log data from 15+ sources",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <SplunkProvider>
          {children}
        </SplunkProvider>
      </body>
    </html>
  );
}
