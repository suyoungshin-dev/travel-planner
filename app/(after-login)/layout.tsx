import Header from "../components/Header";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">

      {/* 본문 */}
      <div className="flex-1 w-full max-w-2xl">
        {children}
      </div>

      {/* footer */}
      <footer className="border-t border-gray-200 bg-white px-5 py-5 text-sm text-gray-600">
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