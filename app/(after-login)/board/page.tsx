"use client";

import { useEffect, useState } from "react";
import BackButton from "@/app/components/common/BackButton";
import PageLayout from "@/app/components/common/PageLayout";
import MainButton from "@/app/components/common/MainButton";

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
  id: string;
  name: string;
  isLeader: boolean;
  isManager: boolean;
  isEvent: boolean;
  isAdmin: boolean;
};

export default function BoardPage() {
  const [currentUser, setCurrentUser] = useState<LoginUser | null>(null);
  const [content, setContent] = useState("");
  const [boards, setBoards] = useState<Board[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const isAdmin =
    currentUser?.isAdmin ||
    currentUser?.isLeader ||
    currentUser?.isManager ||
    currentUser?.isEvent;

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

  useEffect(() => {
    const isLogin = localStorage.getItem("isLogin");
    const loginUserId = localStorage.getItem("loginUserId");
    const loginUserName = localStorage.getItem("loginUserName");

    if (isLogin !== "Y" || !loginUserId || !loginUserName) {
      alert("로그인이 필요합니다.");
      return;
    }

    setTimeout(() => {
      setCurrentUser({
        id: loginUserId,
        name: loginUserName,
        isLeader: localStorage.getItem("isLeader") === "Y",
        isManager: localStorage.getItem("isManager") === "Y",
        isEvent: localStorage.getItem("isEvent") === "Y",
        isAdmin: localStorage.getItem("isAdmin") === "Y",
      });

      getBoards();
    }, 0);
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

  const handleAddComment = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }

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

  const handleDeleteAll = async () => {
    if (!isAdmin) return;

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
    <PageLayout>
      <div className="relative">
        <BackButton />

        {isAdmin && (
          <button
            type="button"
            onClick={handleDeleteAll}
            className="absolute right-0 top-[14px] rounded-[8px] bg-gray-200 px-3 py-1 text-[13px] font-semibold text-gray-700"
          >
            삭제
          </button>
        )}
      </div>

      <p className="title-24">자유롭게 의견을 올려주세요!</p>
      <p className="caption-12">
        (데이터 용량으로 인해 비정기적으로 삭제될 수 있습니다.)
      </p>

      <div className="mt-4 flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddComment();
            }
          }}
          placeholder="한마디 남겨주세요..."
          className="form-input"
        />

        <div className="flex flex-col items-end gap-1">
          <MainButton onClick={handleAddComment} className="w-[50px]">
            등록
          </MainButton>
        </div>
      </div>

      <section className="mt-6 space-y-3">
        {boards.map((board) => {
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
                          className="action-text"
                        >
                          저장
                        </button>

                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditContent("");
                          }}
                          className="action-text-gray"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(board.docId);
                            setEditContent(board.comment);
                          }}
                          className="action-text"
                        >
                          수정
                        </button>

                        <button
                          onClick={() => handleDeleteComment(board.docId)}
                          className="action-text-gray"
                        >
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
    </PageLayout>
  );
}