"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainButton from "@/app/components/common/MainButton";

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
    <main className="relative mx-auto min-h-screen max-w-[430px] bg-white">

      {/* 로고 */}
      <div
        className="
          absolute
          left-[32px]
          top-[56px]
          flex
          h-[28px]
          w-[79px]
          items-center
          justify-center
          rounded-[25px]
          bg-[#E1EEFD]
        "
      >
        <span
          className="
            text-[13px]
            font-normal
            leading-none
            text-[#1C70D7]
          "
        >
          11-1=0 ✈️
        </span>
      </div>

      {/* 안내 문구 */}
      <h1
        className="
          absolute
          left-[32px]
          top-[116px]
          title-24
          text-[#191919]
        "
      >
        입장코드와 이름을
        <br />
        입력해 주세요
      </h1>

      {/* 코드 입력 */}
      <input
        type="password"
        className="
          absolute
          left-[32px]
          top-[244px]
          w-[326px]
          border-b-2
          border-[#1C70D7]
          py-2
          outline-none
          body-15
          text-[#191919]
          placeholder:body-15
          placeholder:text-[#BBBBBB]
        "
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

      {/* 이름 입력 */}
      <input
        className="
          absolute
          left-[32px]
          top-[321px]
          w-[326px]
          border-b-2
          border-[#1C70D7]
          py-2
          outline-none
          body-15
          text-[#191919]
          placeholder:body-15
          placeholder:text-[#BBBBBB]
        "
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름 (두글자, 예: 창섭)"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleLogin();
        }}
      />

      {/* 입장 버튼 */}
      <MainButton
        onClick={handleLogin}
        disabled={loading}
        className="
          absolute
          left-[32px]
          top-[417px]
          h-[54px]
          w-[326px]
          rounded-[12px]
        "
      >
        {loading ? "확인중..." : "입장하기"}
      </MainButton>

    </main>
  );
}