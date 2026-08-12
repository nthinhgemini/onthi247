import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ôn thi 2029 — Luyện thi THPT Quốc gia",
  description: "Ôn thi THPT Quốc gia với ngân hàng câu hỏi, đề thi thử và phân tích kết quả",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-gray-50 font-sans text-gray-900 antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
