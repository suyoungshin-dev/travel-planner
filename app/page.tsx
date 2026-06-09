"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainButton from "@/app/components/common/mainbutton";

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
    <main className="relative mx-auto min-h-screen max-w-[430px] bg-[#FFFFFF]">

      {/* 로고 */}
      <div
        className="absolute left-[32px] top-[116px] flex h-[28px] w-[79px] items-center
        justify-center rounded-[25px] bg-[#E1EEFD]"
      >
        <span className="text-[13px] font-normal leading-none tracking-[0] text-[#1C70D7]">
          11-1=0 ✈️
        </span>
      </div>

      {/* 안내 문구 */}
      <div className="mt-16">
        <h1 className="absolute left-[32px] top-[176px] title-24 text-[#191919]">
          입장코드와 이름을  <br />
          입력해 주세요
        </h1>
      </div>

      {/* 코드 입력 */}
      <div className="mt-6 flex items-center gap-3">
        <input
          type="password"
          //className="input-primary w-full border-b-2 border-[#1C70D7] py-2 text-lg outline-none"
          className="absolute left-[32px] top-[294px] w-[326px]
                     border-b-2 border-[#1C70D7] py-2 outline-none
                     body-15 text-[#191919]
                     placeholder:body-15
                     placeholder:text-[#BBBBBB]"
          value={code}
          maxLength={10}
          placeholder="입장코드"
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
        <input
          className="absolute left-[32px] top-[371] w-[326px]
                     border-b-2 border-[#1C70D7] py-2 outline-none
                     body-15 text-[#191919]
                     placeholder:body-15
                     placeholder:text-[#BBBBBB]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 (두글자, 예: 창섭)"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />
      </div>

      {/* 입장 버튼 */}
      <MainButton
        onClick={handleLogin}
        disabled={loading}
        className="absolute left-[32px] top-[457px] w-[326px] h-54[px] rounded-[12px]"
      >
        {loading ? "확인중..." : "입장하기"}
      </MainButton>
    </main>
  );
} 