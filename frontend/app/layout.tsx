import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import { AuthProvider } from "@/context/AuthContext";
import ReactQueryProvider from "@/providers/queryProvider";
import { RankProvider } from "@/context/RankContext";
import ToastProvider from "@/providers/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kwikly",
  description:
    "Practice smarter, not harder — Kwikly makes studying fun and effective through gamified quizzes based on your lectures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ReactQueryProvider>
            <RankProvider>
              <ToastProvider>
                <Navbar />
                {children}
              </ToastProvider>
            </RankProvider>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
