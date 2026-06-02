"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUserByName } from "./lib/userService";

export default function LoginPage() {
  // 페이지 이동용
  const router = useRouter();

  // 입력 이름 저장
  const [name, setName] = useState("");

  // 로그인 버튼 이벤트
  const handleLogin = async () => {
    const inputName = name.trim();

    if (!inputName) {
      alert("이름을 입력해주세요.");
      return;
    }

    const user = await getUserByName(inputName);

    if (user) {
      localStorage.setItem("isLogin", "Y");
      localStorage.setItem("loginUserId", user.user_id);
      //localStorage.setItem("loginUserName", user.user_name[0]);
      localStorage.setItem("loginUserName", inputName);
      localStorage.setItem("isAdmin", user.auth_yn);

      router.push("/main");
    } else {
      alert("등록된 이름만 입장할 수 있어요.");
    }
  };

  return (
    <main className="px-7 pt-1">
      <p className="mt-6 text-gray-800">이름을 입력해주세요! </p>

      <input
        className="mt-4 w-full max-w-xs rounded-xl border border-pink-50 px-4 py-3 outline-none"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름 두글자를 입력하세요. (예: 창섭)"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleLogin();
          }
        }}
      />

      <button
        onClick={handleLogin}
        className="mt-5 block rounded-2xl bg-pink-500 px-8 py-4 font-bold text-white shadow-md"
      >
        입장하기
      </button>
    </main>
  );
}