"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";

import BackButton from "@/app/components/common/BackButton";
import PageLayout from "@/app/components/common/PageLayout";
import MainButton from "@/app/components/common/MainButtonTemp";

import {
    collection,
    getDocs,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

type Vote = {
    id: string;
    title: string;
    startDT: string;
    endDT: string;
    status: "active" | "done";
    voters: string[];
    crID: string;
    crName: string;
    crDT: Timestamp | null;
};

const TOTAL_USER_COUNT = 11;

export default function VotePage() {
    const router = useRouter();
    const [votes, setVotes] = useState<Vote[]>([]);

    
    // 화면 처음 열릴 때 Firebase에서 투표 목록 조회
    useEffect(() => {
    const fetchVotes = async () => {
        const q = query(
            collection(db, "ele_vote"),
            where("is_deleted", "==", false),
            orderBy("crDT", "desc")
        );

        const querySnapshot = await getDocs(q);

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const todayText = `${yyyy}-${mm}-${dd}`;

        const voteList: Vote[] = querySnapshot.docs.map((docItem) => {
            const data = docItem.data();
            const voters = Array.isArray(data.voters) ? data.voters : [];

            const realStatus =
                data.status === "done" ||
                data.endDT < todayText ||
                voters.length >= TOTAL_USER_COUNT
                    ? "done"
                    : "active";

            return {
                id: docItem.id,
                title: data.title ?? "",
                startDT: data.startDT ?? "",
                endDT: data.endDT ?? "",
                status: realStatus,
                voters,
                crID: data.crID ?? "",
                crName: data.crName ?? "",
                crDT: data.crDT ?? null,
            };
        });

        voteList.sort((a, b) => {
            if (a.status === "active" && b.status === "done") return -1;
            if (a.status === "done" && b.status === "active") return 1;

            return b.startDT.localeCompare(a.startDT);
        });

        setVotes(voteList);
    };

    fetchVotes();
}, []);

    return (
        <PageLayout>
            <BackButton />

            <div className="mt-4 mb-6 flex items-center justify-between">
                <p className="title-24">
                    민주주의의 꽃은 투표입니다
                </p>
            </div>

            <section className="mt-6">
                {votes.length === 0 ? (
                    <div className="rounded-[16px] border border-dashed border-gray-200 bg-white/50 p-5 text-center text-gray-400">
                        등록된 투표가 없습니다.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {votes.map((vote) => (
                            <Link key={vote.id} href={`/vote/${vote.id}`}>
                                <div className="rounded-[16px] border border-[#7E7E7E]/20 bg-[#FFFFFF] p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="line-clamp-1 font-bold text-gray-800">
                                            {vote.title}
                                        </p>

                                        <span className={vote.status === "active" ? "status-badge" : "status-badge-gray"}>
                                            {vote.status === "active" ? "진행" : "완료"}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm text-gray-500">
                                        {vote.startDT.slice(2)} ~ {vote.endDT.slice(2)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <MainButton onClick={() => router.push("/vote/new")} className="mt-8 h-[54px] w-full rounded-[12px]">
                    추가
                </MainButton>
            </section>
        </PageLayout>
    );
}