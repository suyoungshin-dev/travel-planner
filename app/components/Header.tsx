"use client";

import { useRouter } from "next/navigation";

export default function Header() 
{
  // 페이지 이동용 Router
  const router = useRouter();

  // 로고 클릭 이벤트
  const handleHomeClick = () => 
  {
    // 로그인 여부 확인
    const isLogin = localStorage.getItem("isLogin");

    // 로그인 상태일 경우 메인 화면 이동
    if (isLogin === "Y") 
    {
      router.push("/main");
    } 
    // 로그인 안 된 상태일 경우 로그인 화면 이동
    else 
    {
      router.push("/");
    }
  };

  return (
    /* 공통 상단 헤더 */
    <header className="px-5 pt-4 pb-0">

      {/* 사이트 로고 */}
      <h1
        onClick={handleHomeClick}
        className="text-4xl font-bold text-pink-900 cursor-pointer"
      >
        11-1=0 ✈️
      </h1>

    </header>
  );
}