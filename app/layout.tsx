import type { Metadata } from "next";
import "./globals.css";
import HeaderWrapper from "./components/HeaderWrapper";

export const metadata: Metadata = {
  title: "11 Travel Planner",
  description: "여행 계획 사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gradient-to-b from-pink-100 to-violet-100 min-h-screen">
        <div className="min-h-screen flex flex-col">         

          <div className="flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}