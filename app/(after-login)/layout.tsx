"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import { useRouter } from "next/navigation";
import Header from "../components/Header";

import { db } from "@/app/lib/firebase";

// footer에 사용할 사용자 타입
type FooterUser = {
  name: string;
  isLeader: boolean;
  isManager: boolean;
  isEvent: boolean;
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 사용자 목록
  const [users, setUsers] = useState<FooterUser[]>([]);

  // 현재 년도
  const currentYear = new Date().getFullYear();

  // 페이지 이동용
  const router = useRouter();

  // 화면 진입 시 사용자 조회
  useEffect(() => {
    const getUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "ele_user"));

      const userList: FooterUser[] = querySnapshot.docs.map((docItem) => {
        const data = docItem.data();

        return {
          // user_name 배열이면 첫 번째 이름 사용
          name: Array.isArray(data.user_name)
            ? data.user_name[0]
            : data.user_name || "",

          isLeader: data.isLeader ?? false,
          isManager: data.isManager ?? false,
          isEvent: data.isEvent ?? false,
        };
      });

      setUsers(userList);
    };

    getUsers();
  }, []);

  /**
 * 로그아웃
 * localStorage 제거 후 로그인 화면 이동
 */
  const handleLogout = () => {
    // 로그인 정보 제거
    localStorage.removeItem("isLogin");
    localStorage.removeItem("loginUserId");
    localStorage.removeItem("loginUserName");
    localStorage.removeItem("isAdmin");

    // 로그인 화면 이동
    router.push("/");
  };

  // 역할별 사용자 이름 추출
  const leaders = users
    .filter((user) => user.isLeader)
    .map((user) => user.name)
    .join(", ");

  const managers = users
    .filter((user) => user.isManager)
    .map((user) => user.name)
    .join(", ");

  const events = users
    .filter((user) => user.isEvent)
    .map((user) => user.name)
    .join(", ");

  return (
    <div className="min-h-screen flex flex-col">
      {/* 본문 */}
      <div className="flex-1 w-full max-w-2xl">
        {children}
      </div>

      {/* footer */}
      {/* footer */}
      <footer className="border-t border-gray-200 bg-white px-5 py-5 text-sm text-gray-600">

        {/* 제목 */}
        <p className="font-semibold text-pink-700">
          집행부 정보 ({currentYear})
        </p>

        {/* 역할 */}
        <div className="mt-2 flex flex-wrap items-center gap-1 text-sm">
          <p>회장 {leaders || "-"}</p>
          <p>· 총무 {managers || "-"}</p>
          <p>· 오락부장 {events || "-"}</p>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="mt-4 text-xs text-gray-400 transition hover:text-gray-600"
        >
          로그아웃
        </button>

      </footer>
    </div>
  );
}