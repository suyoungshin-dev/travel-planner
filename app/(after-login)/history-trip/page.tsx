"use client";

import { useRouter } from "next/navigation";
import BackButton from "@/app/components/BackButton";

type HistoryTrip = {
  id: number;
  title: string;
  tripDate: string;
  updatedAt: string;
  writerName: string;
};

export default function HistoryTripPage() {
  const router = useRouter();

  // 지난 여행 임시 데이터
  const historyTrips: HistoryTrip[] = [
    {
      id: 1,
      title: "2025 여행",
      tripDate: "2025.10.18 ~ 2025.10.19",
      updatedAt: "2026.05.29",
      writerName: "수영",
    },
    {
      id: 2,
      title: "2024 여행",
      tripDate: "2024.09.21 ~ 2024.09.22",
      updatedAt: "2026.05.20",
      writerName: "유빈",
    },
  ];

  // 목록 클릭 시 상세 화면 이동
  const handleRowClick = (id: number) => {
    router.push(`/history-trip/${id}`);
  };

  return (
    <main className="px-5 py-4">
      {/* 뒤로가기 버튼 */}
      <BackButton />

      <p className="mt-2 text-xs text-gray-500">
        테스트 화면이랍니다..
      </p>

      {/* 게시판 목록 */}
      <section className="mt-4 rounded-2xl bg-white shadow-sm">
        {/* 헤더 */}
        <div className="grid grid-cols-[60px_1fr_180px_120px_100px] border-b border-gray-200 px-4 py-3 text-sm font-bold text-gray-500">
          <div>번호</div>
          <div>제목</div>
          <div>여행날짜</div>
          <div>등록일</div>
          <div>등록자</div>
        </div>

        {/* 목록 */}
        {historyTrips.map((trip, index) => (
          <div
            key={trip.id}
            onClick={() => handleRowClick(trip.id)}
            className="grid cursor-pointer grid-cols-[60px_1fr_180px_120px_100px] border-b border-gray-100 px-4 py-4 text-sm hover:bg-pink-50"
          >
            <div>{index + 1}</div>
            <div className="font-medium text-gray-800">{trip.title}</div>
            <div className="text-gray-500">{trip.tripDate}</div>
            <div className="text-gray-500">{trip.updatedAt}</div>
            <div className="text-gray-500">{trip.writerName}</div>
          </div>
        ))}
      </section>
    </main>
  );
}