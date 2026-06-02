"use client";

import { use } from "react";
import BackButton from "@/app/components/BackButton";

type Vote = {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  isAnonymous: boolean;

  // 작성/수정 사용자 정보
  crID?: string;
  crName?: string;
  modID?: string;
  modName?: string;

  options: {
    id: string;
    text: string;
    count: number;
  }[];
};

// 임시 투표 데이터
const votes: Vote[] = [
  {
    id: "3",
    title: "단체티",
    status: "done",
    startDate: "2026-05-01",
    endDate: "2026-05-10",
    isAnonymous: true,
    crID: "user_007",
    crName: "수영",
    modID: "user_007",
    modName: "수영",
    options: [
      { id: "1", text: "한다", count: 5 },
      { id: "2", text: "안 한다", count: 2 },
    ],
  },
  {
    id: "4",
    title: "저녁 메뉴",
    status: "done",
    startDate: "2026-05-01",
    endDate: "2026-05-10",
    isAnonymous: false,
    crID: "user_008",
    crName: "아영",
    modID: "user_008",
    modName: "아영",
    options: [
      { id: "1", text: "돼지", count: 4 },
      { id: "2", text: "소", count: 4 },
      { id: "3", text: "회", count: 1 },
    ],
  },
];

export default function VoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // 로그인 사용자 정보
  const loginUserId = localStorage.getItem("loginUserId") ?? "";
  const loginUserName = localStorage.getItem("loginUserName") ?? "";
  const isAdmin = localStorage.getItem("isAdmin") === "Y";

  // ID에 맞는 투표 찾기
  const vote = votes.find((vote) => vote.id === id);

  if (!vote) {
    return (
      <main className="px-4 py-3">
        <BackButton />
        <p className="text-gray-500">만드는 중! 데헷</p>
      </main>
    );
  }

  // 집행부거나 작성자면 수정/삭제 가능  ** 추후 수정
  //const canEdit = isAdmin || vote.crID === loginUserId;

  // 전체 투표 수
  const totalCount = vote.options.reduce(
    (sum, option) => sum + option.count,
    0
  );

  // 최고 득표 수
  const maxCount = Math.max(...vote.options.map((option) => option.count));

  // 나중에 DB 저장할 때 사용할 기본 데이터
  /*
  const saveBaseData = {
    crID: loginUserId,
    crName: loginUserName,
    modID: loginUserId,
    modName: loginUserName,
  };
  */

  return (
    <main className="px-4 py-3">
      <BackButton />

      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{vote.title}</h1>

        
        {/*canEdit && (
          <button className="rounded-lg bg-gray-200 px-3 py-1 text-sm font-bold text-gray-700">
            수정
          </button>
        )*/}
      </div>

      <p className="mb-6 text-sm text-gray-500">
        {vote.startDate} ~ {vote.endDate}
      </p>

      <div className="mb-4 rounded-2xl bg-white/70 p-5 shadow-md">
        <p className="font-bold text-gray-800">투표 결과</p>

        <p className="mt-1 text-sm text-gray-500">
          총 {totalCount}표 {vote.isAnonymous ? "· 익명투표" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {vote.options.map((option) => {
          // 득표율 계산
          const percent =
            totalCount === 0
              ? 0
              : Math.round((option.count / totalCount) * 100);

          // 최고 득표 여부
          const isWinner = option.count === maxCount;

          return (
            <div
              key={option.id}
              className="rounded-2xl bg-white/70 p-5 shadow-md"
            >
              <div className="flex justify-between gap-3">
                <p className="font-bold text-gray-800">{option.text}</p>

                <p
                  className={`text-sm font-semibold ${isWinner ? "text-pink-600" : "text-gray-500"
                    }`}
                >
                  {option.count}표
                </p>
              </div>

              <div
                className={`mt-3 h-3 overflow-hidden rounded-full ${isWinner ? "bg-pink-100" : "bg-gray-200"
                  }`}
              >
                <div
                  className={`h-full rounded-full ${isWinner ? "bg-pink-500" : "bg-gray-400"
                    }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <p className="mt-2 text-right text-sm text-gray-500">
                {percent}%
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}