"use client";

import { useEffect, useState } from "react";
import BackButton from "@/app/components/BackButton";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  setDoc,
  orderBy,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";

type Board = {
  docId: string;
  comment: string;
  user_id: string;
  user_name: string;
  cr_dt: Timestamp | null;
  mod_dt: Timestamp | null;
  is_deleted: boolean;
};

type LoginUser = {
  id: string; // 로그인한 사용자 ID
  name: string; // 로그인한 사용자 이름
  authYn: "Y" | "N"; // 집행부 여부
};

export default function BoardPage() {
  // 현재 로그인한 사용자 정보
  // 로그인 화면에서 localStorage에 저장해둔 값을 여기서 꺼내서 사용
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(null);

  const [content, setContent] = useState("");
  const [boards, setBoards] = useState<Board[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // 화면 처음 열릴 때 로그인 사용자 정보 + 게시글 목록 조회
  useEffect(() => {
    const isLogin = localStorage.getItem("isLogin");
    const loginUserId = localStorage.getItem("loginUserId");
    const loginUserName = localStorage.getItem("loginUserName");
    const isAdmin = localStorage.getItem("isAdmin");

    if (isLogin !== "Y" || !loginUserId || !loginUserName) {
      alert("로그인이 필요합니다.");
      return;
    }

    setCurrentUser({
      id: loginUserId,
      name: loginUserName,
      authYn: isAdmin === "Y" ? "Y" : "N",
    });

    getBoards();
  }, []);

  const formatDate = (date: Timestamp | null) => {
    if (!date) return "";

    return date.toDate().toLocaleString("ko-KR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // 삭제되지 않은 게시글만 조회
  const getBoards = async () => {
    const q = query(
      collection(db, "ele_board"),
      where("is_deleted", "==", false),
       orderBy("cr_dt", "desc")
    );

    const querySnapshot = await getDocs(q);

    const boardList: Board[] = querySnapshot.docs.map((docItem) => {
      const data = docItem.data();

      return {
        docId: docItem.id,
        comment: data.comment ?? "",
        user_id: data.user_id ?? "",
        user_name: data.user_name ?? "",
        cr_dt: data.cr_dt ?? null,
        mod_dt: data.mod_dt ?? null,
        is_deleted: data.is_deleted ?? false,
      };
    });

    setBoards(boardList);
  };

  // 새 글 등록
  const handleAddComment = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }

    // 문서 ID를 260602_랜덤값 형태로 생성
    const today = new Date();
    const yy = String(today.getFullYear()).slice(2);
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const randomId = Math.random().toString(36).substring(2, 8);
    const docId = `${yy}${mm}${dd}_${randomId}`;

    await setDoc(doc(db, "ele_board", docId), {
      comment: content,
      cr_dt: serverTimestamp(),
      mod_dt: serverTimestamp(),
      user_id: currentUser.id,
      user_name: currentUser.name,
      is_deleted: false,
    });

    setContent("");
    getBoards();
  };

  // 본인 글 삭제
  const handleDeleteComment = async (docId: string) => {
    if (!currentUser) return;

    const isOk = confirm("삭제할까요?");
    if (!isOk) return;

    await updateDoc(doc(db, "ele_board", docId), {
      is_deleted: true,
      mod_dt: serverTimestamp(),
      mod_id: currentUser.id,
      mod_name: currentUser.name,
    });

    getBoards();
  };

  // 집행부용 전체 삭제
  // 실제 삭제가 아니라 is_deleted=true 처리
  const handleDeleteAll = async () => {
    if (!currentUser || currentUser.authYn !== "Y") return;

    const isOk = confirm("전체 게시글을 삭제할까요?");
    if (!isOk) return;

    const querySnapshot = await getDocs(collection(db, "ele_board"));

    await Promise.all(
      querySnapshot.docs.map((docItem) =>
        deleteDoc(doc(db, "ele_board", docItem.id))
      )
    );

    alert("삭제되었습니다.");
    getBoards();
  };

  // 본인 글 수정 저장
  const handleSaveEdit = async (docId: string) => {
    if (!currentUser) return;

    if (!editContent.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }

    await updateDoc(doc(db, "ele_board", docId), {
      comment: editContent,
      mod_dt: serverTimestamp(),
      mod_id: currentUser.id,
      mod_name: currentUser.name,
    });

    setEditingId(null);
    setEditContent("");
    getBoards();
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mt-6 flex items-center gap-2">
        <BackButton />

        {currentUser?.authYn === "Y" && (
          <button
            onClick={handleDeleteAll}
            className="ml-2 -mt-4 rounded-xl bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-700"
          >
            삭제
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">
        자유롭게 의견을 올려주세요.. <br />
        (데이터 용량으로 인해 비정기적으로 삭제될 수 있습니다.)
      </p>

      <div className="mt-4 flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="한마디 남겨주세요..."
          className="flex-1 rounded-xl border border-pink-200 px-4 py-3 outline-none"
        />

        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleAddComment}
            className="rounded-xl bg-pink-500 px-5 py-3 font-bold text-white shadow-md"
          >
            등록
          </button>


        </div>
      </div>

      <section className="mt-6 space-y-3">
        {boards.map((board) => {
          // 작성자 본인인지 확인
          // 본인 글일 때만 수정/삭제 버튼 표시
          const isMine =
            currentUser !== null &&
            board.user_id.trim() === currentUser.id.trim();

          const isEdited =
            board.cr_dt &&
            board.mod_dt &&
            board.cr_dt.toMillis() !== board.mod_dt.toMillis();

          return (
            <div key={board.docId} className="border-b border-gray-200 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {editingId === board.docId ? (
                    <input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full rounded border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
                    />
                  ) : (
                    <p className="break-words text-gray-800">
                      {board.comment}
                    </p>
                  )}

                  <div className="mt-1 text-sm text-gray-400">
                    {board.user_name} / {formatDate(board.mod_dt)}
                    {isEdited && <span> · 수정됨</span>}
                  </div>
                </div>

                {isMine && (
                  <div className="flex shrink-0 gap-2 text-sm">
                    {editingId === board.docId ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(board.docId)}
                          className="font-semibold text-pink-500"
                        >
                          저장
                        </button>

                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditContent("");
                          }}
                          className="text-gray-400"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(board.docId); setEditContent(board.comment); }} className="font-semibold text-pink-500">
                          수정
                        </button>

                        <button onClick={() => handleDeleteComment(board.docId)} className="text-gray-400">
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}