import type { ReactNode } from "react";

export default function AfterLoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">{children}</div>

      <footer className="border-t border-gray-200 bg-white px-6 py-5 text-sm text-gray-600">
        <div className="space-y-1">
          <p className="font-semibold text-pink-700">집행부 정보 (2026)</p>
          <p>회장: 김유빈</p>
          <p>총무: 신수영</p>
          <p>오락부장 : 박예은</p>
        </div>
      </footer>
    </div>
  );
}