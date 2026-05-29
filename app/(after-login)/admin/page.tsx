"use client";

import { useState } from "react";
import BackButton from "@/app/components/BackButton";

// 사용자 타입
type User = {
  id: string;
  name: string;
  authYn: "Y" | "N";
};

export default function AdminPage() {
  // 최초 사용자 데이터
  const initialUsers: User[] = [
    { id: "user_001", name: "수영", authYn: "Y" },
    { id: "user_002", name: "유빈", authYn: "N" },
    { id: "user_003", name: "수현", authYn: "N" },
  ];

  // 화면에서 수정 중인 사용자 목록
  const [users, setUsers] = useState<User[]>(initialUsers);

  // 원복용 원본 데이터
  const [originalUsers, setOriginalUsers] = useState<User[]>(initialUsers);

  // 집행부 체크 변경
  const handleChangeAuth = (id: string) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              authYn: user.authYn === "Y" ? "N" : "Y",
            }
          : user
      )
    );
  };

  // 저장 버튼
  const handleSave = () => {
    // TODO: 나중에 DB 저장 처리
    setOriginalUsers(users);
    alert("저장되었습니다.");
  };

  // 취소 버튼
  const handleCancel = () => {
    // 원본 데이터로 원복
    setUsers(originalUsers);
  };

  return (
    <main className="px-5 py-4">
      {/* 뒤로가기 + 안내문구 */}
      <BackButton message="사용자 정보와 집행부 권한을 관리합니다." />

      {/* 사용자 목록 */}
      <section className="mt-4 rounded-2xl bg-white shadow-sm">
        {/* 헤더 */}
        <div className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-gray-200 px-4 py-3 text-sm font-bold text-gray-500">
          <div>ID</div>
          <div>이름</div>
          <div>집행부</div>
        </div>

        {/* 사용자 목록 */}
        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-gray-100 px-4 py-4 text-sm"
          >
            {/* 사용자 ID */}
            <div className="text-gray-500">{user.id}</div>

            {/* 사용자 이름 */}
            <div className="font-medium text-gray-800">{user.name}</div>

            {/* 집행부 여부 체크박스 */}
            <div>
              <input
                type="checkbox"
                checked={user.authYn === "Y"}
                onChange={() => handleChangeAuth(user.id)}
                className="h-5 w-5 accent-pink-500"
              />
            </div>
          </div>
        ))}
      </section>

      {/* 저장 / 취소 버튼 */}
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={handleCancel}
          className="rounded-xl bg-gray-100 px-5 py-2 font-bold text-gray-500"
        >
          취소
        </button>

        <button
          onClick={handleSave}
          className="rounded-xl bg-pink-500 px-5 py-2 font-bold text-white"
        >
          저장
        </button>
      </div>
    </main>
  );
}