"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/app/components/BackButton";

type Comment = {
    id: number;
    content: string;
    writerId: string;
    writerName: string;
    createdAt: string;
    isEdited?: boolean;

};

export default function BoardPage() {
    const currentUser = {
        id: "user_001",
        name: "수영",
    };

    const router = useRouter();

    const [content, setContent] = useState("");

    // 현재 수정중인 댓글 id
    const [editingId, setEditingId] = useState<number | null>(null);

    // 수정 입력값
    const [editContent, setEditContent] = useState("");

    const [comments, setComments] = useState<Comment[]>([
        {
            id: 1,
            content: "단체티 여부 논의 중 / 차량 협의 예정",
            writerId: "user_001",
            writerName: "수영",
            createdAt: "26.05.29 13:59",
        },
        {
            id: 2,
            content: "보드게임 챙길 사람 정하자",
            writerId: "user_002",
            writerName: "유빈",
            createdAt: "26.05.29 14:10",
        },
    ]);

    const handleAddComment = () => {
        if (!content.trim()) {
            alert("내용을 입력해주세요!");
            return;
        }

        const now = new Date();

        const newComment: Comment = {
            id: comments.length + 1,
            content,
            writerId: currentUser.id,
            writerName: currentUser.name,
            createdAt: now.toLocaleString("ko-KR", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
        };

        setComments([newComment, ...comments]);
        setContent("");
    };

    const handleDeleteComment = (id: number) => {
        const isOk = confirm("삭제할까요?");
        if (!isOk) return;

        setComments(comments.filter((comment) => comment.id !== id));
    };

    // 수정 내용 저장
    const handleSaveEdit = (id: number) => {
        if (!editContent.trim()) {
            alert("내용을 입력해주세요!");
            return;
        }

        setComments(
            comments.map((comment) =>
                comment.id === id
                    ? {
                        ...comment,
                        content: editContent,
                        isEdited: true,

                        // 수정 시간으로 변경
                        createdAt: new Date().toLocaleString("ko-KR", {
                            year: "2-digit",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        }),
                    }
                    : comment
            )
        );

        setEditingId(null);
        setEditContent("");
    };

    return (
        <main className="min-h-screen bg-white-50 p-6">
            {/* 뒤로가기 버튼 */}
            <BackButton />      

            <p className="mt-2 text-gray-500">
                자유롭게 의견 주세요. 100% 수용 장담 못함 (100일 단위로 삭제됩니다.)
            </p>

            <div className="mt-2 flex gap-2">
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="한마디 남겨주세요."
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
                {comments.map((comment) => {
                    const isMine = comment.writerId === currentUser.id;

                    return (
                        <div key={comment.id} className="border-b border-gray-200 py-4">
                            {/* 내용 + 작성자 정보 + 수정삭제 */}
                            <div className="flex items-center justify-between">
                                {/* 왼쪽 영역 */}
                                <div className="flex flex-1 items-center gap-2">

                                    {/* 수정중이면 input 표시 */}
                                    {editingId === comment.id ? (
                                        <input
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-96 rounded border border-pink-200 px-3 py-1 text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-800">
                                            {comment.content}
                                        </p>
                                    )}

                                    {/* 작성자 / 작성시간 */}
                                    <span className="text-sm text-gray-400">
                                        ({comment.writerName} / {comment.createdAt})
                                    </span>

                                    {/* 수정된 글이면 표시 */}
                                    {comment.isEdited && (
                                        <span className="text-xs text-gray-400">
                                            * 수정됨
                                        </span>
                                    )}
                                </div>

                                {/* 내 글만 수정/삭제 표시 */}
                                {isMine && (
                                    <div className="flex gap-2 text-sm">
                                        {editingId === comment.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleSaveEdit(comment.id)}
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
                                                        setEditingId(comment.id);
                                                        setEditContent(comment.content);
                                                    }}
                                                    className="text-pink-500"
                                                >
                                                    수정
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
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