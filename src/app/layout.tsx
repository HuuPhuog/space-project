import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Space | Lightweight Collaborative Workspace",
  description: "A lightweight collaborative workspace for student teams & small projects. Simple, beautiful, and fast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full dark select-none">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <div className="min-h-full flex flex-col">{children}</div>
        </SessionProvider>
      </body>
    </html>
  );
}
