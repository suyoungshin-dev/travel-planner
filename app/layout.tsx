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
      <body className="bg-gradient-to-b from-pink-100 to-violet-100 min-h-screen">
        <div className="min-h-screen flex flex-col">
          <Header />

          <div className="flex-1">
            {children}
          </div>

          <footer className="border-t border-gray-200 bg-white px-6 py-5 text-sm text-gray-600">
            <div className="space-y-1">
              <p className="font-semibold text-pink-700">모임 정보 (2026년 기준)</p>
              <p>회장: 김유빈</p>
              <p>총무: 신수영</p>
              <p>오락부장 : 박예은</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}