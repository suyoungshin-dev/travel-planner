"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function Header() {

  // 페이지 이동용 Router
  const router = useRouter();

  // 현재 경로 확인
  const pathname = usePathname();

  const searchParams = useSearchParams();

  // 집행부 여부
  const isAdmin = false;

  // 화면별 메뉴명
  const getTitle = () => {

    if (pathname.includes("/trip")) {
      const mode = searchParams.get("mode");

      if (mode === "new") {
        return "여행 추가하기";
      }

      return "다가오는 여행";
    }

    if (pathname.includes("/history-trip")) {
      return "지난 여행보기";
    }

    if (pathname.includes("/board")) {
      return "건의사항";
    }

    if (pathname.includes("/main")) {
      return "";
    }

    return "";
  };

  // 로고 클릭 이벤트
  const handleHomeClick = () => {

    const isLogin = localStorage.getItem("isLogin");

    if (isLogin === "Y") {
      router.push("/main");
    }
    else {
      router.push("/");
    }
  };

  return (

    /* 공통 상단 헤더 */
    <header className="mb-0 flex items-center gap-3 px-5 pt-4">

      {/* 사이트 로고 */}
      <h1
        onClick={handleHomeClick}
        className="cursor-pointer text-4xl font-bold text-pink-900"
      >
        11-1=0 ✈️
      </h1>

      {/* 메뉴명 */}
      <div className="flex items-end gap-2">

        {/* 현재 화면 메뉴명 */}
        {getTitle() && (
          <span className="text-xl font-bold text-pink-500">
            {getTitle()}
          </span>
        )}

        {/* 집행부 표시 */}
        {isAdmin && (
          <span className="text-sm font-bold text-gray-400">
            (집행부)
          </span>
        )}

      </div>

    </header>
  );
}