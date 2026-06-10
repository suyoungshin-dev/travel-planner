import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {children}
      </body>
    </html>
  );
}