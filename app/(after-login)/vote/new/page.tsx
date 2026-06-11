"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

import BackButton from "@/app/components/common/BackButton";
import PageLayout from "@/app/components/common/PageLayout";
import SectionDivider from "@/app/components/common/SectionDivider";
import MainButton from "@/app/components/common/MainButton";
import SubButton from "@/app/components/common/SubButton";

type LoginUser = {
    id: string;
    name: string;
    isLeader: boolean;
    isManager: boolean;
    isEvent: boolean;
};

export default function VoteNewPage() {
    const router = useRouter();

    const [currentUser, setCurrentUser] = useState<LoginUser | null>(null);

    const [title, setTitle] = useState("");
    const [startDT, setStartDT] = useState("");
    const [endDT, setEndDT] = useState("");

    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isMultiple, setIsMultiple] = useState(false);
    const [allowAddOption, setAllowAddOption] = useState(true);
    const [isExecutiveOnly] = useState(false);

    const [options, setOptions] = useState<string[]>(["", ""]);

    // 오늘 날짜 yyyy-mm-dd
    const getToday = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}`;
    };

    // 기본 종료일: 오늘 + 7일
    const getDefaultEndDT = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}`;
    };

    useEffect(() => {
        const isLogin = localStorage.getItem("isLogin");
        const loginUserId = localStorage.getItem("loginUserId");
        const loginUserName = localStorage.getItem("loginUserName");

        if (isLogin !== "Y" || !loginUserId || !loginUserName) {
            alert("로그인이 필요합니다.");
            router.push("/");
            return;
        }

        setTimeout(() => {
            setCurrentUser({
                id: loginUserId,
                name: loginUserName,
                isLeader: localStorage.getItem("isLeader") === "Y",
                isManager: localStorage.getItem("isManager") === "Y",
                isEvent: localStorage.getItem("isEvent") === "Y",
            });

            setStartDT(getToday());
            setEndDT(getDefaultEndDT());
        }, 0);
    }, [router]);

    // 옵션 입력값 변경
    const handleChangeOption = (index: number, value: string) => {
        setOptions(
            options.map((option, optionIndex) =>
                optionIndex === index ? value : option
            )
        );
    };

    // 옵션 추가
    const handleAddOption = () => {
        setOptions([...options, ""]);
    };

    // 옵션 삭제
    const handleDeleteOption = (index: number) => {
        if (options.length <= 2) {
            alert("투표 항목은 최소 2개 이상이어야 합니다.");
            return;
        }

        setOptions(options.filter((_, optionIndex) => optionIndex !== index));
    };

    // 투표 등록
    const handleSave = async () => {
        if (!currentUser) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }

        if (!startDT || !endDT) {
            alert("투표 기간을 선택해주세요.");
            return;
        }

        const today = getToday();

        if (startDT < today) {
            alert("시작일은 오늘보다 과거일 수 없습니다.");
            return;
        }

        if (endDT < today) {
            alert("종료일은 오늘보다 과거일 수 없습니다.");
            return;
        }

        if (endDT < startDT) {
            alert("종료일은 시작일보다 빠를 수 없습니다.");
            return;
        }

        const cleanOptions = options
            .map((option) => option.trim())
            .filter((option) => option !== "");

        if (cleanOptions.length < 2) {
            alert("투표 항목은 최소 2개 이상 입력해주세요.");
            return;
        }

        const randomId = Math.random().toString(36).substring(2, 8);
        const docId = `vote_${randomId}`;

        await setDoc(doc(db, "ele_vote", docId), {
            title: title.trim(),
            startDT,
            endDT,

            status: "active",

            isAnonymous,
            isMultiple,
            allowAddOption,
            isExecutiveOnly,

            options: cleanOptions.map((option, index) => ({
                id: `option_${index + 1}`,
                text: option,
                userIds: [],
                userNames: [],
            })),

            voters: [],

            crID: currentUser.id,
            crName: currentUser.name,
            crDT: serverTimestamp(),

            is_deleted: false,
        });

        alert("투표가 등록되었습니다.");
        router.push("/vote");
    };

    return (
        <PageLayout>
            <BackButton />

            <h1 className="mb-6 text-[22px] font-bold text-[#111111]">투표 등록</h1>

            <section className="space-y-4">
                {/* 제목 */}
                <div>
                    <span className="label-text">제목</span>
                    <span className="required-star">*</span>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력해주세요."
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1C70D7]"
                    />
                </div>

                {/* 기간 */}
                <div>
                    <span className="label-text">기간</span>
                    <span className="required-star">*</span>

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={startDT}
                            onChange={(e) => setStartDT(e.target.value)}
                            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1C70D7]"
                        />

                        <input
                            type="date"
                            value={endDT}
                            onChange={(e) => setEndDT(e.target.value)}
                            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1C70D7]"
                        />
                    </div>
                </div>

                <SectionDivider />

                {/* 옵션 */}
                <div>
                    <div className="mb-2 flex items-center">
                        <span className="label-text">투표 항목</span>
                        <span className="required-star">*</span>

                        <button
                            type="button"
                            onClick={handleAddOption}
                            className="ml-auto rounded-lg bg-[#EAF3FF] px-3 py-1 text-[13px] font-bold text-[#1C70D7]"
                        >
                            + 항목 추가
                        </button>
                    </div>

                    <div className="space-y-2">
                        {options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    value={option}
                                    onChange={(e) => handleChangeOption(index, e.target.value)}
                                    placeholder={`항목 ${index + 1}`}
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1C70D7]"
                                />

                                <button
                                    type="button"
                                    onClick={() => handleDeleteOption(index)}
                                    className="rounded-xl bg-gray-100 px-3 text-sm font-bold text-gray-500"
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <SectionDivider />

                {/* 투표 설정 */}
                <div>
                    <span className="label-text">투표 설정</span>

                    <div className="mt-3 space-y-3">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="h-4 w-4 accent-[#1C70D7]"
                            />
                            익명 투표
                        </label>

                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={isMultiple}
                                onChange={(e) => setIsMultiple(e.target.checked)}
                                className="h-4 w-4 accent-[#1C70D7]"
                            />
                            복수 선택 가능
                        </label>

                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={allowAddOption}
                                onChange={(e) => setAllowAddOption(e.target.checked)}
                                className="h-4 w-4 accent-[#1C70D7]"
                            />
                            참여자가 항목 추가 가능
                        </label>
                    </div>
                </div>
            </section>

            <div className="mt-6 flex gap-2">
                <MainButton onClick={handleSave} className="flex-1">
                    등록
                </MainButton>

                <SubButton onClick={() => router.push("/vote")} className="flex-1">
                    취소
                </SubButton>
            </div>
        </PageLayout>
    );
}