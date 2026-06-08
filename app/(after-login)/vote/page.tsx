"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BackButton from "@/app/components/BackButton";
import { useRouter } from "next/navigation";

import {
    collection,
    getDocs,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

// 투표 목록에서 사용할 타입
type Vote = {
    id: string;
    title: string;
    startDT: string;
    endDT: string;
    status: "active" | "done";
    voters: string[];
    crID: string;
    crName: string;
    crDT: any;
};

// 전체 인원 수
const TOTAL_USER_COUNT = 11;

export default function VotePage() {
    const [votes, setVotes] = useState<Vote[]>([]);

    // 화면 처음 열릴 때 Firebase에서 투표 목록 조회
    useEffect(() => {
        getVotes();
    }, []);

    // 오늘 날짜 yyyy-mm-dd
    const getToday = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}`;
    };

    // Firebase 투표 목록 조회
    const getVotes = async () => {
        const q = query(
            collection(db, "ele_vote"),
            where("is_deleted", "==", false),
            orderBy("crDT", "desc")
        );

        const querySnapshot = await getDocs(q);
        const today = getToday();

        const voteList: Vote[] = querySnapshot.docs.map((docItem) => {
            const data = docItem.data();  // 객체 -> 필드

            // 종료일이 오늘보다 작으면 완료 처리
            const voters = Array.isArray(data.voters) ? data.voters : [];

            const realStatus =
                data.status === "done" ||
                    data.endDT < today ||
                    voters.length >= TOTAL_USER_COUNT
                    ? "done"
                    : "active";

            return {
                id: docItem.id,
                title: data.title ?? "",
                startDT: data.startDT ?? "",
                endDT: data.endDT ?? "",
                status: realStatus,
                voters: voters,
                crID: data.crID ?? "",
                crName: data.crName ?? "",
                crDT: data.crDT ?? null,
            };
        });

        setVotes(voteList);
    };

    // 진행중인 투표만 분리
    const activeVotes = votes.filter((vote) => vote.status === "active");

    // 완료된 투표만 분리
    const doneVotes = votes.filter((vote) => vote.status === "done");

    const router = useRouter();

    return (
        <main className="px-4 py-3">
            {/* 뒤로가기 버튼 */}
            <BackButton />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">투표</h1>

                <button
                    onClick={() => router.push("/vote/new")}
                    className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-bold text-white shadow-md"
                >
                    + 추가
                </button>
            </div>

            <p className="mt-2 text-xs text-gray-500">
                민주주의의 꽃은 투표입니다~
            </p>

            {/* 진행중인 투표 영역 */}
            <section className="mb-4 mt-6">
                <h2 className="mb-3 text-lg font-bold text-pink-600">
                    진행중인 투표
                </h2>

                {activeVotes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-pink-100 bg-white/50 p-5 text-center text-gray-400">
                        진행중인 투표가 없습니다.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {activeVotes.map((vote) => (
                            <Link key={vote.id} href={`/vote/${vote.id}`}>
                                <div className="rounded-2xl bg-white/70 p-5 shadow-md">
                                    <p className="font-bold text-gray-800">{vote.title}</p>

                                    <p className="mt-2 text-sm text-gray-500">
                                        {vote.startDT} ~ {vote.endDT}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        등록자: {vote.crName || "-"}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* 진행 완료된 투표 영역 */}
            <section>
                <h2 className="mt-10 text-lg font-bold text-gray-900">
                    진행 완료된 투표
                </h2>

                {doneVotes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/50 p-5 text-center text-gray-400">
                        진행 완료된 투표가 없습니다.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {doneVotes.map((vote) => (
                            <Link key={vote.id} href={`/vote/${vote.id}`}>
                                <div className="rounded-2xl bg-white/60 p-5 shadow-sm">
                                    <p className="font-bold text-gray-700">{vote.title}</p>

                                    <p className="mt-2 text-sm text-gray-500">
                                        {vote.startDT} ~ {vote.endDT}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        등록자: {vote.crName || "-"}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}