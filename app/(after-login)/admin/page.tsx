"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/app/components/common/BackButton";
import MainButton from "@/app/components/common/MainButton";
import SubButton from "@/app/components/common/SubButton";

// Firebase
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import PageLayout from "@/app/components/common/PageLayout";

// 화면에서 사용할 사용자 타입
type User = {
  docId: string; // Firebase 문서 ID
  id: string; // user_id
  nameText: string; // user_name 배열을 콤마 문자열로 변환한 값
  isLeader: boolean; // 회장
  isManager: boolean; // 총무
  isEvent: boolean; // 오락부장
};

export default function AdminPage() {
  // 화면에서 수정 중인 사용자 목록
  const [users, setUsers] = useState<User[]>([]);

  // 취소 버튼 눌렀을 때 되돌릴 원본 데이터
  const [originalUsers, setOriginalUsers] = useState<User[]>([]);

  const router = useRouter();

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

          // Firebase에 값이 없으면 false로 처리
          isLeader: data.isLeader ?? false,
          isManager: data.isManager ?? false,
          isEvent: data.isEvent ?? false,
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

  // 회장 체크 변경
  const handleChangeLeader = (id: string) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
            ...user,
            isLeader: !user.isLeader,
          }
          : user
      )
    );
  };

  // 총무 체크 변경
  const handleChangeManager = (id: string) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
            ...user,
            isManager: !user.isManager,
          }
          : user
      )
    );
  };

  // 오락부장 체크 변경
  const handleChangeEvent = (id: string) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
            ...user,
            isEvent: !user.isEvent,
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

        // 화면 입력값을 Firebase 저장 형식으로 변환
        // 예: "창섭, 창섭이" → ["창섭", "창섭이"]
        const nameArray = user.nameText
          .split(",")
          .map((name) => name.trim())
          .filter((name) => name !== "");

        await updateDoc(userRef, {
          user_name: nameArray,
          isLeader: user.isLeader,
          isManager: user.isManager,
          isEvent: user.isEvent,
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
    //setUsers(originalUsers);
    router.back();
  };

  return (
    <PageLayout>
      {/* 뒤로가기 + 안내문구 */}

      <BackButton />
      {/* 설명 문구 */}
      <p className="title-24">
        사용자 정보와 <br/> 집행부 권한을 관리합니다.
      </p>

      <div className="mt-2 flex justify-end">
        <button
          onClick={() => router.push("/admin/code")}
          className="rounded-xl bg-[#EAF3FF] px-4 py-2 text-sm font-bold text-[#1C70D7] hover:bg-[#DCEBFF]"
        >
          코드 관리
        </button>
      </div>

      {/* 사용자 목록 */}
      <section className="mt-4 rounded-2xl border border-gray-100 bg-white">
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-[0.8fr_1.8fr_0.6fr_0.6fr_0.8fr] border-b border-gray-200 px-4 py-3 text-xs font-bold text-[#5B6B87]">
          <div>ID</div>
          <div>이름</div>
          <div className="text-center">회장</div>
          <div className="text-center">관리</div>
          <div className="text-center">오락부장</div>
        </div>

        {/* 사용자 목록 */}
        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[0.8fr_1.8fr_0.6fr_0.6fr_0.8fr] items-center border-b border-gray-100 px-4 py-4 text-sm"
          >
            {/* 사용자 ID */}
            <div className="text-gray-500">{user.id}</div>

            {/* 사용자 이름 수정 */}
            <div>
              <input
                value={user.nameText}
                onChange={(e) => handleChangeName(user.id, e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-800 outline-none focus:border-[#1C70D7]"
                placeholder="예: 수영, 수영이"
              />
            </div>

            {/* 회장 여부 */}
            <div className="text-center">
              <input
                type="checkbox"
                checked={user.isLeader}
                onChange={() => handleChangeLeader(user.id)}
                className="h-5 w-5 accent-[#1C70D7]"
              />
            </div>

            {/* 총무 여부 */}
            <div className="text-center">
              <input
                type="checkbox"
                checked={user.isManager}
                onChange={() => handleChangeManager(user.id)}
                className="h-5 w-5 accent-[#1C70D7]"
              />
            </div>

            {/* 오락부장 여부 */}
            <div className="text-center">
              <input
                type="checkbox"
                checked={user.isEvent}
                onChange={() => handleChangeEvent(user.id)}
                className="h-5 w-5 accent-[#1C70D7]"
              />
            </div>
          </div>
        ))}
      </section>

      {/* 저장 / 취소 버튼 */}
      <div className="mt-5 flex gap-2">
        <MainButton
          onClick={handleSave}
          className="flex-1"
        >
          저장
        </MainButton>
        <SubButton
          onClick={handleCancel}
          className="flex-1"
        >
          취소
        </SubButton>
      </div>
    </PageLayout>
  );
}