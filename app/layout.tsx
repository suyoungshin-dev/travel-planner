import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Travel Planner",
  description: "여행 계획 사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-pink-50 min-h-screen">
        <Header />
        {children}
      </body>
    </html>
  );
}