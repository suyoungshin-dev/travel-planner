"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Smile } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/";

  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const adminYn = localStorage.getItem("isAdmin");
    const loginUserName = localStorage.getItem("loginUserName");

    setIsAdmin(adminYn === "Y");
    setUserName(loginUserName ?? "");
  }, [pathname]);

  const getTitle = () => {
    if (pathname.includes("/history-trip/new")) return "여행 추가하기";
    if (pathname.includes("/trip")) return "저장된 여행정보";
    if (pathname.includes("/history-trip")) return "여행";
    if (pathname.includes("/board")) return "한줄대화";
    if (pathname.includes("/vote")) return "투표";
    if (pathname.includes("/admin")) return "관리";
    if (pathname.includes("/notice")) return "공지사항";

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

    <header className="relative h-[90]">
      <h1
        onClick={handleHomeClick}
        className="
                    absolute left-[32px] top-[53px]
                    flex h-[28px] w-[79px]
                    cursor-pointer items-center justify-center
                    rounded-[25px]
                    bg-[#E1EEFD]
                    text-[13px] font-normal leading-none
                    text-[#1C70D7]"
      >
        11-1=0 ✈️
      </h1>

      {!isLoginPage && (
        <div className="absolute right-[20px] top-[53px] flex items-center gap-2">
          {userName && (
            <span className="flex items-center gap-[4px] text-[12px] font-normal leading-[20px] text-[#000000]">
              <Smile size={14} strokeWidth={2} />
              {userName}
            </span>
          )}

          {isAdmin && pathname !== "/admin" && (
            <button
              onClick={() => router.push("/admin")}
              className="flex h-[22px] w-[37px] items-center justify-center rounded-[4px] bg-[#191919] text-[12px] font-bold text-white"
            >
              관리
            </button>
          )}
        </div>
      )}

    </header>
  );
}