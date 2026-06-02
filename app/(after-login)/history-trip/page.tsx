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
type HistoryTrip = {
  id: string; // Firebase 문서 ID
  title: string; // 여행 제목
  tripDate: string; // 여행 날짜 문자열
  updatedAt: string; // 수정일
  writerName: string; // 작성자
};

export default function HistoryTripPage() {
  const router = useRouter();

  // 화면에 보여줄 지난 여행 목록
  const [historyTrips, setHistoryTrips] = useState<HistoryTrip[]>([]);

  // 화면 최초 진입 시 실행
  useEffect(() => {
    const getHistoryTrips = async () => {
      // 오늘 날짜 구하기 (예: 2026-06-02)
      const today = new Date().toISOString().slice(0, 10);

      // Firebase 조회 조건
      // endDate가 오늘보다 이전인 여행만 조회
      const q = query(
        collection(db, "ele_trip"),

        // 최근 여행부터 정렬
        orderBy("endDate", "desc")
      );

      // Firebase 조회 실행
      const querySnapshot = await getDocs(q);

      // 화면용 배열 생성
      const tripList: HistoryTrip[] = querySnapshot.docs.map((docSnap) => {
        // 여행 데이터
        const data = docSnap.data();

        return {
          id: docSnap.id,

          title: data.title,

          tripDate: `${data.startDate}~${data.endDate}`,

          updatedAt: data.modDT?.toDate
            ? data.modDT.toDate().toISOString().slice(0, 10)
            : "",

          // 등록자 표시
          // 새 데이터: modName 사용
          // 예전 데이터: modName이 없으면 modID 표시
          writerName: data.modName ?? data.modID ?? "",
        };
      });

      // 화면 상태 저장
      setHistoryTrips(tripList);
    };

    // 함수 실행
    getHistoryTrips();
  }, []);

  // 목록 클릭 시 상세 화면 이동
  const handleRowClick = (id: string) => {
    router.push(`/history-trip/${id}`);
  };

  return (
    <main className="px-5 py-4">
      {/* 뒤로가기 버튼 */}
      <BackButton />

      {/* 설명 문구 */}
      <p className="mt-2 text-xs text-gray-500">
        여행가자
      </p>

      {/* 게시판 영역 */}
      <section className="mt-4 rounded-2xl bg-white shadow-sm">
        {/* 헤더 */}
        <div className="grid grid-cols-[50px_1fr_90px] border-b border-gray-200 px-4 py-3 text-sm font-bold text-gray-500 sm:grid-cols-[60px_1fr_180px_120px_100px]">
          <div>번호</div>

          <div>제목</div>

          {/* 모바일에서는 숨김 */}
          <div className="hidden sm:block">
            여행날짜
          </div>

          <div>등록일</div>

          {/* 모바일에서는 숨김 */}
          <div className="hidden sm:block">
            등록자
          </div>
        </div>

        {/* 목록 */}
        {historyTrips.map((trip, index) => (
          <div
            key={trip.id}
            onClick={() => handleRowClick(trip.id)}
            className="grid cursor-pointer grid-cols-[50px_1fr_90px] border-b border-gray-100 px-4 py-4 text-sm hover:bg-pink-50 sm:grid-cols-[60px_1fr_180px_120px_100px]"
          >
            {/* 번호 */}
            <div>{index + 1}</div>

            {/* 제목 */}
            <div className="font-medium text-gray-800">
              {trip.title}
            </div>

            {/* 여행 날짜 */}
            <div className="hidden text-gray-500 sm:block">
              {trip.tripDate}
            </div>

            {/* 등록일 */}
            <div className="text-gray-500">
              {trip.updatedAt}
            </div>

            {/* 등록자 */}
            <div className="hidden text-gray-500 sm:block">
              {trip.writerName}
            </div>
          </div>
        ))}

        {/* 데이터 없을 때 */}
        {historyTrips.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400">
            지난 여행 데이터가 없어요 🥲
          </div>
        )}


      </section>
      {/* 추가 버튼 */}
      <button
        onClick={() => router.push("/history-trip/new")}
        className="mt-5 rounded-2xl bg-pink-500 px-6 py-3 text-sm font-bold text-white shadow-md"
      >
        추가
      </button>

    </main>
  );
}