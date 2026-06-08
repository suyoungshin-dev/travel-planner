"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Firebase
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "./lib/firebase";

// 사용자 조회
import { getUserByName } from "./lib/userService";

export default function LoginPage() {
  // 페이지 이동용
  const router = useRouter();

  // 입장 코드
  const [code, setCode] = useState("");

  // 입력 이름
  const [name, setName] = useState("");

  // 로딩 여부
  const [loading, setLoading] = useState(false);

  /**
   * 로그인 처리
   * 1. 코드 확인
   * 2. 사용자 확인
   * 3. localStorage 저장
   * 4. 메인 이동
   */
  const handleLogin = async () => {
    try {
      // 앞뒤 공백 제거
      const inputCode = code.trim();
      const inputName = name.trim();

      // 코드 빈값 체크
      if (!inputCode) {
        alert("입장 코드를 입력해주세요.");
        return;
      }

      // 이름 빈값 체크
      if (!inputName) {
        alert("이름을 입력해주세요.");
        return;
      }

      setLoading(true);

      // 입장 코드 확인
      const q = query(
        collection(db, "ele_code"),
        where("code", "==", inputCode),
        where("isUse", "==", true)
      );

      const querySnapshot = await getDocs(q);

      // 사용자 확인
      const user = await getUserByName(inputName);

      // 결과값 정리
      const isCodeOk = !querySnapshot.empty;
      const isUserOk = !!user;

      // 코드, 이름 둘 다 틀림
      if (!isCodeOk && !isUserOk) {
        alert("입장 코드와 이름을 확인해주세요.");
        return;
      }

      // 코드만 틀림
      if (!isCodeOk) {
        alert("입장 코드를 확인해주세요.");
        return;
      }

      // 이름만 틀림
      if (!isUserOk) {
        alert("이름을 확인해주세요.");
        return;
      }

      /**
       * 로그인 정보 저장
       * 모든 화면에서 공통 사용
       */
      localStorage.setItem("isLogin", "Y");

      localStorage.setItem(
        "loginUserId",
        user.user_id
      );

      localStorage.setItem(
        "loginUserName",
        inputName
      );

      localStorage.setItem(
        "isAdmin",
        user.isLeader || user.isManager || user.isEvent
          ? "Y"
          : "N"
      );

      // 메인 이동
      router.push("/main");
    } catch (error) {
      console.error(error);

      alert("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="px-7 pt-1">
      {/* 안내 문구 */}
      <p className="mt-6 text-gray-800">
        입장 코드와 이름을 입력해주세요!
      </p>

      {/* 코드 입력 */}
      <div className="mt-6 flex items-center gap-3">
        <label className="w-20 text-sm font-bold text-gray-700">
          코드
        </label>

        <input
          type="password"
          className="w-full max-w-xs rounded-xl border border-pink-50 px-4 py-2 outline-none"
          value={code}
          maxLength={10}
          placeholder="코드를 입력하세요."
          onChange={(e) => {
            // 숫자만 입력 가능
            const onlyNumber = e.target.value.replace(/[^0-9]/g, "");
            setCode(onlyNumber);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />
      </div>

      {/* 이름 입력 */}
      <div className="mt-4 flex items-center gap-3">
        <label className="w-20 text-sm font-bold text-gray-700">
          이름
        </label>

        <input
          className="w-full max-w-xs rounded-xl border border-pink-50 px-4 py-3 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 두글자를 입력하세요. (예: 창섭)"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />
      </div>

      {/* 입장 버튼 */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="mt-5 block rounded-2xl bg-pink-500 px-8 py-4 font-bold text-white shadow-md disabled:bg-gray-300"
      >
        {loading ? "확인중..." : "입장하기"}
      </button>
    </main>
  );
} 