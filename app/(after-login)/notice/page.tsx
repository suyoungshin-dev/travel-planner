"use client";

import { useEffect, useState } from "react";

// 페이지 이동용
import { useRouter } from "next/navigation";

// 공통 뒤로가기 버튼
import BackButton from "@/app/components/BackButton";

// Firebase
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";

// 화면에서 사용할 타입
type Notice = {
    id: string; // Firebase 문서 ID
    title: string; // 공지 제목
    comment: string; // 공지 내용
    isNotice: boolean; // 공지 체크 여부
    updatedAt: string; // 최종 수정일
    writerName: string; // 최종 수정자
};

export default function NoticePage() {
    const router = useRouter();

    // 화면에 보여줄 공지사항 목록
    const [notices, setNotices] = useState<Notice[]>([]);

    // 화면 최초 진입 시 실행
    useEffect(() => {
        const getNotices = async () => {

            // user_id로 사용자 이름 찾기
            const getUserName = async (userID: string) => {
                const userQuery = query(
                    collection(db, "ele_user"),
                    where("user_id", "==", userID)
                );

                const userSnapshot = await getDocs(userQuery);

                if (userSnapshot.empty) {
                    return userID;
                }

                const userData = userSnapshot.docs[0].data();

                return Array.isArray(userData.user_name)
                    ? userData.user_name.join(",")
                    : userData.user_name ?? userID;
            };

            // Firebase 조회 조건
            const q = query(
                collection(db, "ele_notice"),

                // 최근 수정된 공지부터 정렬
                orderBy("modDT", "desc")
            );

            // Firebase 조회 실행
            const querySnapshot = await getDocs(q);

            // 화면용 배열 생성
            const noticeList: Notice[] = await Promise.all(
                querySnapshot.docs.map(async (docSnap) => {
                    const data = docSnap.data();

                    const writerName = await getUserName(data.crID ?? "");
                    const modifierName = await getUserName(data.modID ?? "");

                    return {
                        id: docSnap.id,
                        title: data.title ?? "",
                        comment: data.comment ?? "",
                        isNotice: data.isNotice ?? false,

                        updatedAt: data.modDT?.toDate
                            ? data.modDT.toDate().toISOString().slice(0, 10)
                            : "",

                        writerName: modifierName,
                    };
                })
            );

            // 화면 상태 저장
            setNotices(noticeList);
        };

        // 함수 실행
        getNotices();
    }, []);

    // 목록 클릭 시 공지사항 상세 화면 이동
    const handleRowClick = (id: string) => {
        router.push(`/notice/${id}`);
    };

    return (
        <main className="px-5 py-4">
            {/* 뒤로가기 버튼 */}
            <BackButton />

            {/* 설명 문구 */}
            <p className="mt-2 text-xs text-gray-500">
                공지사항이에요! 누구나 등록할 수 있답니다~
            </p>

            {/* 게시판 영역 */}
            <section className="mt-4 rounded-2xl bg-white shadow-sm">
                {/* 헤더 */}
                <div className="grid grid-cols-[50px_1fr_90px] border-b border-gray-200 px-4 py-3 text-sm font-bold text-gray-500 sm:grid-cols-[60px_1fr_100px_120px_100px]">
                    <div>번호</div>

                    <div>제목</div>

                    {/* 모바일에서는 숨김 */}
                    <div className="hidden sm:block">
                        공지
                    </div>

                    <div>최종수정일</div>

                    {/* 모바일에서는 숨김 */}
                    <div className="hidden sm:block">
                        최종수정자
                    </div>
                </div>

                {/* 목록 */}
                {notices.map((notice, index) => (
                    <div
                        key={notice.id}
                        onClick={() => handleRowClick(notice.id)}
                        className="grid cursor-pointer grid-cols-[50px_1fr_90px] border-b border-gray-100 px-4 py-4 text-sm hover:bg-pink-50 sm:grid-cols-[60px_1fr_100px_120px_100px]"
                    >
                        {/* 번호 */}
                        <div>{index + 1}</div>

                        {/* 제목 */}
                        <div className="font-medium text-gray-800">
                            {notice.title}
                        </div>

                        {/* 공지 여부 */}
                        <div className="hidden text-gray-500 sm:block">
                            {notice.isNotice ? "O" : "X"}
                        </div>

                        {/* 최종 수정일 */}
                        <div className="text-gray-500">
                            {notice.updatedAt}
                        </div>

                        {/* 최종 수정자 */}
                        <div className="hidden text-gray-500 sm:block">
                            {notice.writerName}
                        </div>
                    </div>
                ))}

                {/* 데이터 없을 때 */}
                {notices.length === 0 && (
                    <div className="py-10 text-center text-sm text-gray-400">
                        공지사항이 없어요 🥲
                    </div>
                )}
            </section>

            {/* 추가 버튼 */}
            <button
                onClick={() => router.push("/notice/new")}
                className="mt-5 rounded-2xl bg-pink-500 px-6 py-3 text-sm font-bold text-white shadow-md"
            >
                추가
            </button>
        </main>
    );
}