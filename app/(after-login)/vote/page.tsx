"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import BackButton from "@/app/components/BackButton";

export default function VotePage() {
    const router = useRouter();

    // 임시 투표 데이터
    // 나중에 Firebase에서 가져오도록 바꿀 예정
    const votes = [
        {
            id: "1",
            title: "10월 여행 숙소 정하기",
            status: "active",
            startDate: "2026-05-30",
            endDate: "2026-06-05",
        },
        {
            id: "2",
            title: "저녁 메뉴 고르기",
            status: "active",
            startDate: "2026-05-30",
            endDate: "2026-06-01",
        },
        {
            id: "3",
            title: "단체티",
            status: "done",
            startDate: "2026-05-01",
            endDate: "2026-05-10",
        },
        {
            id: "4",
            title: "저녁메뉴",
            status: "done",
            startDate: "2026-05-29",
            endDate: "2026-05-30",
        },
    ];

    // 진행중인 투표만 분리
    const activeVotes = votes.filter((vote) => vote.status === "active");

    // 완료된 투표만 분리
    const doneVotes = votes.filter((vote) => vote.status === "done");

    return (

        <main className="px-4 py-3">
            {/* 뒤로가기 버튼 */}
            <BackButton />

            <h1 className="mb-6 text-2xl font-bold text-gray-800">투표</h1>

            {/* 진행중인 투표 영역 */}
            <section className="mb-8">
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
                                        {vote.startDate} ~ {vote.endDate}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* 진행 완료된 투표 영역 */}
            <section>
                <h2 className="mb-3 text-lg font-bold text-gray-700">
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
                                        {vote.startDate} ~ {vote.endDate}
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