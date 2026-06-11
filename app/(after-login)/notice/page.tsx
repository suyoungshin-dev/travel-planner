"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/app/lib/firebase";

import BackButton from "@/app/components/common/BackButton";
import PageLayout from "@/app/components/common/PageLayout";
import MainButton from "@/app/components/common/MainButton";

// Firebase
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
} from "firebase/firestore";

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
        <PageLayout>
            {/* 뒤로가기 버튼 */}
            <BackButton />

            {/* 설명 문구 */}
             <p className="title-24">
                공지사항이에요! <br/>
                누구나 등록할 수 있어요
            </p>

            {/* 게시판 영역 */}
            {/* 공지 목록 */}
            <section className="mt-4 flex flex-col gap-3">
                {notices.map((notice, index) => (
                    <div
                        key={notice.id}
                        onClick={() => handleRowClick(notice.id)}
                        className="cursor-pointer rounded-[16px] border border-[#7E7E7E]/20 bg-[#FFFFFF] p-4"
                    >

                        <div className="flex items-start justify-between gap-3">
                            <p className="line-clamp-1 text-[15px] font-bold text-gray-800">
                                {notice.title}
                            </p>

                            {notice.isNotice && (
                                <span className="shrink-0 rounded-full bg-pink-100 px-2 py-1 text-[11px] font-bold text-pink-500">
                                    공지
                                </span>
                            )}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                            <span>
                                최종 수정 : {notice.writerName || "-"} ({notice.updatedAt || "-"})
                            </span>
                        </div>
                    </div>
                ))}

                {notices.length === 0 && (
                    <div className="rounded-[16px] border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
                        공지사항이 없어요 🥲
                    </div>
                )}
            </section>

            {/* 추가 버튼 */}
            <MainButton className="mt-5 w-full"  // 꽉 차는 버튼! 반반은 flex-1, 작은건 w-[120px] 정도로 구분..
                onClick={() => router.push("/notice/new")}                
            >
                추가
            </MainButton>
        </PageLayout>
    );
}