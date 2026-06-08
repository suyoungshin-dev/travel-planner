"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isLoginPage = pathname === "/";

  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const getLoginUser = () => {
      const adminYn = localStorage.getItem("isAdmin");
      const loginUserName = localStorage.getItem("loginUserName");

      setIsAdmin(adminYn === "Y");
      setUserName(loginUserName ?? "");
    };

    getLoginUser();
  }, [pathname]);

  const getTitle = () => {
    if (pathname.includes("/trip")) {
      const mode = searchParams.get("mode");

      if (mode === "new") return "여행 추가하기";

      return "다가오는 여행";
    }

    if (pathname.includes("/history-trip")) return "여행목록";
    if (pathname.includes("/board")) return "한줄대화";
    if (pathname.includes("/admin")) return "관리";
    if (pathname.includes("/main")) return "";

    return "";
  };

  const handleHomeClick = () => {
    const isLogin = localStorage.getItem("isLogin");

    if (isLogin === "Y") {
      router.push("/main");
    } else {
      router.push("/");
    }
  };

  return (
    <header className="px-5 pt-4">
      {/* 1줄: 로고 / 로그인 사용자 / 관리 버튼 */}
      <div className="flex w-full items-end justify-between">
        <h1
          onClick={handleHomeClick}
          className="cursor-pointer text-4xl font-bold text-[#1C70D7]"
        >
          11-1=0 ✈️
        </h1>

        {!isLoginPage && (
          <div className="flex items-center gap-2 pb-1">
            {userName && (
              <span className="text-sm font-bold text-gray-500">
                👤 {userName}
              </span>
            )}

            {isAdmin && pathname !== "/admin" && (
              <button
                onClick={() => router.push("/admin")}
                className="rounded-lg bg-gray-200 px-3 py-1 text-sm font-bold text-gray-700"
              >
                관리
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2줄: 페이지 제목 */}
      {getTitle() && (
        <div className="mt-3">
          <span className="text-xl font-bold text-pink-500">
            {getTitle()}
          </span>
        </div>
      )}
    </header>
  );
}