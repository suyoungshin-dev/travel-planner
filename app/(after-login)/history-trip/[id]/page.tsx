"use client";

import BackButton from "@/app/components/BackButton";

export default function HistoryTripDetailPage() {

  // 임시 데이터
  const tripDetail = {
    title: "2025 강릉 여행",
    startDate: "2025-10-18",
    endDate: "2025-10-19",
    accommodation: "숙소",
    content:
      "강릉 중앙시장 방문\n삼겹살 + 보드게임 진행\n숙소 체크인 15:00",
    expense: "350000",
  };

  return (
    <main className="px-5 py-4">

      {/* 뒤로가기 버튼 */}
      <BackButton />

      <p className="mt-2 text-xs text-gray-500">
        테스트 화면이랍니다..
      </p>

      {/* 상세 영역 */}
      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">

        {/* 제목 */}
        <div className="mb-5">

          <p className="mb-2 text-sm font-bold text-gray-500">
            제목
          </p>

          <input
            value={tripDetail.title}
            disabled
            className="w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-50"
          />

        </div>

        {/* 날짜 */}
        <div className="mb-5">

          <p className="mb-2 text-sm font-bold text-gray-500">
            날짜
          </p>

          <div className="flex items-center gap-2">

            <input
              value={tripDetail.startDate}
              disabled
              className="w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-50"
            />

            <span className="text-gray-400">~</span>

            <input
              value={tripDetail.endDate}
              disabled
              className="w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-50"
            />

          </div>

        </div>

        {/* 숙소 */}
        <div className="mb-5">

          <p className="mb-2 text-sm font-bold text-gray-500">
            숙소
          </p>

          <input
            value={tripDetail.accommodation}
            disabled
            className="w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-50"
          />

        </div>

        {/* 내용 */}
        <div className="mb-5">

          <p className="mb-2 text-sm font-bold text-gray-500">
            내용
          </p>

          <textarea
            value={tripDetail.content}
            disabled
            className="h-40 w-full resize-none rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-50"
          />

        </div>

        {/* 지출 */}
        <div>

          <p className="mb-2 text-sm font-bold text-gray-500">
            지출
          </p>

          <div className="flex items-center gap-2">

            <input
              value={Number(tripDetail.expense).toLocaleString()}
              disabled
              className="w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-50"
            />

            <span className="text-gray-500">
              원
            </span>

          </div>

        </div>

      </section>

    </main>
  );
}