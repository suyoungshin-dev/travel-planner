"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

import BackButton from "@/app/components/common/BackButton";
import PageLayout from "@/app/components/common/PageLayout";

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
    const [isExecutiveOnly, setIsExecutiveOnly] = useState(false);

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

        setCurrentUser({
            id: loginUserId,
            name: loginUserName,
            isLeader: localStorage.getItem("isLeader") === "Y",
            isManager: localStorage.getItem("isManager") === "Y",
            isEvent: localStorage.getItem("isEvent") === "Y",
        });

        setStartDT(getToday());
        setEndDT(getDefaultEndDT());
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

            <h1 className="mb-6 text-2xl font-bold text-gray-800">투표 등록</h1>

            <section className="space-y-4">
                {/* 제목 */}
                <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">
                        제목 *
                    </label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력해주세요."
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-pink-300"
                    />
                </div>

                {/* 기간 */}
                <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">
                        기간 *
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={startDT}
                            onChange={(e) => setStartDT(e.target.value)}
                            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-pink-300"
                        />

                        <input
                            type="date"
                            value={endDT}
                            onChange={(e) => setEndDT(e.target.value)}
                            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-pink-300"
                        />
                    </div>
                </div>

                {/* 옵션 */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-bold text-gray-700">
                            투표 항목 *
                        </label>

                        <button
                            onClick={handleAddOption}
                            className="rounded-lg bg-pink-100 px-3 py-1 text-sm font-bold text-pink-600"
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
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-pink-300"
                                />

                                <button
                                    onClick={() => handleDeleteOption(index)}
                                    className="rounded-xl bg-gray-100 px-3 text-sm font-bold text-gray-500"
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 설정 */}
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="mb-3 text-sm font-bold text-gray-700">투표 설정</p>

                    <label className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="h-4 w-4 accent-pink-500"
                        />
                        익명 투표
                    </label>

                    <label className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={isMultiple}
                            onChange={(e) => setIsMultiple(e.target.checked)}
                            className="h-4 w-4 accent-pink-500"
                        />
                        복수 선택 가능
                    </label>

                    <label className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={allowAddOption}
                            onChange={(e) => setAllowAddOption(e.target.checked)}
                            className="h-4 w-4 accent-pink-500"
                        />
                        참여자가 항목 추가 가능
                    </label>

                    {/* 추후 필요할 수 있어서 추가 (isExecutiveOnly) */}
                    {/* <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isExecutiveOnly}
              onChange={(e) => setIsExecutiveOnly(e.target.checked)}
              className="h-4 w-4 accent-pink-500"
            />
            집행부 전용
          </label> */}
                </div>
            </section>

            <div className="mt-6 flex justify-end gap-2">
                <button
                    onClick={() => router.push("/vote")}
                    className="rounded-xl bg-gray-100 px-5 py-2 font-bold text-gray-500"
                >
                    취소
                </button>

                <button
                    onClick={handleSave}
                    className="rounded-xl bg-pink-500 px-5 py-2 font-bold text-white"
                >
                    등록
                </button>
            </div>
        </PageLayout>
    );
}