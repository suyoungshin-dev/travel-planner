"use client";

import { useEffect, useState } from "react";
import BackButton from "@/app/components/BackButton";

// Firebase
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
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

export default function BoardPage() {
  const currentUser = {
    id: "user_001",
    name: "수영",
  };

  const [content, setContent] = useState("");
  const [boards, setBoards] = useState<Board[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

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

  const getBoards = async () => {
    const q = query(
      collection(db, "ele_board"),
      where("is_deleted", "==", false)
    );

    const querySnapshot = await getDocs(q);

    const boardList: Board[] = querySnapshot.docs.map((docItem) => {
      const data = docItem.data();

      return {
        docId: docItem.id,
        comment: data.comment,
        user_id: data.user_id,
        user_name: data.user_name,
        cr_dt: data.cr_dt ?? null,
        mod_dt: data.mod_dt ?? null,
        is_deleted: data.is_deleted,
      };
    });

    setBoards(boardList);
  };

  useEffect(() => {
    getBoards();
  }, []);

  const handleAddComment = async () => {
    if (!content.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }

    await addDoc(collection(db, "ele_board"), {
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
    const isOk = confirm("삭제할까요?");
    if (!isOk) return;

    await updateDoc(doc(db, "ele_board", docId), {
      is_deleted: true,
      mod_dt: serverTimestamp(),
    });

    getBoards();
  };

  const handleSaveEdit = async (docId: string) => {
    if (!editContent.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }

    await updateDoc(doc(db, "ele_board", docId), {
      comment: editContent,
      mod_dt: serverTimestamp(),
    });

    setEditingId(null);
    setEditContent("");
    getBoards();
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <BackButton />

      <p className="mt-2 text-xs text-gray-500">
        자유롭게 의견을 올려주세요. <br />
        올린다고 100% 반영되진 않아요.. <br />
        (데이터 용량으로 인해 멋대로 삭제될 수 있습니다.) <br />
      </p>

      <div className="mt-4 flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="한마디 남겨주세요.. 아직 저장은 안됩니다.. 되는 것처럼 보일뿐.."
          className="flex-1 rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400"
        />

        <button
          onClick={handleAddComment}
          className="rounded-xl bg-pink-500 px-5 font-bold text-white shadow-md"
        >
          등록
        </button>
      </div>

      <section className="mt-6 space-y-3">
        {boards.map((board) => {
          const isMine = board.user_id === currentUser.id;
          const isEdited =
            board.cr_dt &&
            board.mod_dt &&
            board.cr_dt.toMillis() !== board.mod_dt.toMillis();

          return (
            <div key={board.docId} className="border-b border-gray-200 py-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center gap-2">
                  {editingId === board.docId ? (
                    <input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-96 rounded border border-pink-200 px-3 py-1 text-sm"
                    />
                  ) : (
                    <p className="text-gray-800">{board.comment}</p>
                  )}

                  <span className="text-sm text-gray-400">
                    ({board.user_name} / {formatDate(board.mod_dt)})
                  </span>

                  {isEdited && (
                    <span className="text-xs text-gray-400">* 수정됨</span>
                  )}
                </div>

                {isMine && (
                  <div className="flex gap-2 text-sm">
                    {editingId === board.docId ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(board.docId)}
                          className="text-pink-500"
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
                        <button
                          onClick={() => {
                            setEditingId(board.docId);
                            setEditContent(board.comment);
                          }}
                          className="text-pink-500"
                        >
                          수정
                        </button>

                        <button
                          onClick={() => handleDeleteComment(board.docId)}
                          className="text-gray-400"
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
    </main>
  );
}