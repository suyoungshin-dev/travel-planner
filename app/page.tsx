"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() 
{

  // 페이지 이동용
  const router = useRouter();

  // 입력 이름 저장
  const [name, setName] = useState("");

  // 테스트 이름
  const testUsers = ["수현", "아영", "수연", "나영", "미리", "보배", "현민", "예지", "영연", "유빈", "수영", "예은"];

  // 로그인 버튼 이벤트
  const handleLogin = () => {
    if (testUsers.includes(name.trim())) 
    {
      localStorage.setItem("isLogin", "Y");
      router.push("/main");
    }
    else 
    {
      alert("등록된 이름만 입장할 수 있어요.");
    }
  };

  return (
    <main className="px-7 pt-1">

      <p className="mt-6 text-gray-800">이름을 입력해주세요</p>

      <input
        className="mt-4 w-full max-w-xs rounded-xl border border-pink-50 px-4 py-3 outline-none"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예: 유빈 (본명 두글자를 입력하세요)"
        
        onKeyDown={(e) => {
          if (e.key === "Enter") 
          {
            handleLogin();
          }
        }}
      />

      {/* 로그인 버튼 */}
      <button
        onClick={handleLogin}
        className="mt-5 block rounded-2xl bg-pink-500 px-8 py-4 font-bold text-white shadow-md"
      >
        입장하기
      </button>
    </main>
  );
}