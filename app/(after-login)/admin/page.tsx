"use client";

import { useEffect, useState } from "react";
import BackButton from "@/app/components/BackButton";

// Firebase
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

// 화면에서 사용할 사용자 타입
type User = {
  docId: string; // Firebase 문서 ID
  id: string; // user_id
  nameText: string; // user_name 배열을 콤마 문자열로 변환한 값
  authYn: "Y" | "N"; // 집행부 여부
};

export default function AdminPage() {
  // 화면에서 수정 중인 사용자 목록
  const [users, setUsers] = useState<User[]>([]);

  // 취소 버튼 눌렀을 때 되돌릴 원본 데이터
  const [originalUsers, setOriginalUsers] = useState<User[]>([]);

  // 화면 최초 진입 시 Firebase 사용자 목록 조회
  useEffect(() => {
    const getUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "ele_user"));

      const userList: User[] = querySnapshot.docs.map((docItem) => {
        const data = docItem.data();

        return {
          docId: docItem.id,
          id: data.user_id,

          // Firebase의 user_name 배열을 화면 표시용 문자열로 변환
          // 예: ["창섭", "창섭이"] → "창섭, 창섭이"
          nameText: Array.isArray(data.user_name)
            ? data.user_name.join(", ")
            : data.user_name || "",

          authYn: data.auth_yn === "Y" ? "Y" : "N",
        };
      });

      setUsers(userList);
      setOriginalUsers(userList);
    };

    getUsers();
  }, []);

  // 이름 입력값 변경
  const handleChangeName = (id: string, value: string) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
            ...user,
            nameText: value,
          }
          : user
      )
    );
  };

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
  const handleSave = async () => {
    try {
      for (const user of users) {
        const userRef = doc(db, "ele_user", user.docId);

        // 화면 입력값을 Firebase 저장 형식으로 변환 (trim 처리함)
        const nameArray = user.nameText
          .split(",")
          .map((name) => name.trim())
          .filter((name) => name !== "");

        await updateDoc(userRef, {
          user_name: nameArray,
          auth_yn: user.authYn,
        });
      }

      // 저장 성공 후 현재 값을 원본으로 갱신
      setOriginalUsers(users);

      alert("저장되었습니다.");
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 취소 버튼
  const handleCancel = () => {
    // Firebase를 다시 조회하는 게 아니라, 화면 최초/마지막 저장값으로 되돌림
    setUsers(originalUsers);
  };

  return (
    <main className="px-5 py-4">
      {/* 뒤로가기 + 안내문구 */}
      <BackButton message="사용자 정보와 집행부 권한을 관리합니다." />

      {/* 사용자 목록 */}
      <section className="mt-4 rounded-2xl bg-white shadow-sm">
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-[0.9fr_2fr_0.5fr] border-b border-gray-200 px-4 py-3 text-sm font-bold text-gray-500">
          <div>ID</div>
          <div>이름</div>
          <div>집행부</div>
        </div>

        {/* 사용자 목록 */}
        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[0.9fr_2fr_0.5fr] items-center border-b border-gray-100 px-4 py-4 text-sm"
          >
            {/* 사용자 ID */}
            <div className="text-gray-500">{user.id}</div>

            {/* 사용자 이름 수정 */}
            <div>
              <input
                value={user.nameText}
                onChange={(e) => handleChangeName(user.id, e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-800 outline-none focus:border-pink-300"
                placeholder="예: 수영, 수영이"
              />
            </div>

            {/* 집행부 여부 */}
            <div className="pl-3">
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
        <button onClick={handleCancel} className="rounded-xl bg-gray-100 px-5 py-2 font-bold text-gray-500">
          취소
        </button>

        <button onClick={handleSave} className="rounded-xl bg-pink-500 px-5 py-2 font-bold text-white">
          저장
        </button>
      </div>
    </main>
  );
}