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

    if (pathname.includes("/history-trip")) return "여행 저장";
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
    <header className="mb-0 flex items-center gap-3 px-5 pt-4">
      <div className="flex items-end gap-2">
        <h1
          onClick={handleHomeClick}
          className="cursor-pointer text-4xl font-bold text-pink-900"
        >
          11-1=0 ✈️
        </h1>

        {!isLoginPage && userName && (
          <span className="pb-1 text-sm font-bold text-gray-500">
            👤 {userName}
          </span>
        )}
      </div>

      <div className="flex items-end gap-2">
        {getTitle() && (
          <span className="text-xl font-bold text-pink-500">{getTitle()}</span>
        )}

        {!isLoginPage && isAdmin && pathname !== "/admin" && (
          <button
            onClick={() => router.push("/admin")}
            className="ml-1 rounded-lg bg-gray-200 px-3 py-1 text-sm font-bold text-gray-700"
          >
            관리
          </button>
        )}
      </div>
    </header>
  );
}