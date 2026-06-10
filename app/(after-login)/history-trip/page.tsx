"use client";

import { useEffect, useState } from "react";

// 페이지 이동용
import { useRouter } from "next/navigation";

// 공통 뒤로가기 버튼
import BackButton from "@/app/components/BackButton";

// 버튼
import MainButton from "@/app/components/common/mainbutton";

// Firebase
import { collection, getDocs, query, orderBy } from "firebase/firestore";

import { db } from "@/app/lib/firebase";

// 화면에서 사용할 타입
type HistoryTrip = {
  id: string;

  // 여행 제목
  title: string;

  // 여행 날짜
  tripDate: string;

  // 최종 수정일
  updatedAt: string;

  // 최종 수정자
  writerName: string;
};

export default function HistoryTripPage() {
  const router = useRouter();

  // 화면에 보여줄 여행 목록
  const [historyTrips, setHistoryTrips] = useState<HistoryTrip[]>([]);

  // 화면 처음 진입 시 실행
  useEffect(() => {
    const getHistoryTrips = async () => {
      // Firebase 조회 조건
      const q = query(
        collection(db, "ele_trip"),

        // 최근 여행부터 정렬
        orderBy("endDate", "desc")
      );

      // Firebase 조회 실행
      const querySnapshot = await getDocs(q);

      // 화면에 사용할 배열 생성
      const tripList: HistoryTrip[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          // Firebase 문서 ID
          id: docSnap.id,

          // 여행 제목
          title: data.title ?? "",

          // 여행 기간
          tripDate: `${data.startDate} ~ ${data.endDate}`,

          // 수정일
          updatedAt: data.modDT?.toDate
            ? data.modDT.toDate().toISOString().slice(0, 10)
            : "",

          // 수정자
          writerName: data.modName ?? data.modID ?? "",
        };
      });

      // 화면 상태 저장
      setHistoryTrips(tripList);
    };

    getHistoryTrips();
  }, []);

  // 카드 클릭 시 상세화면 이동
  const handleCardClick = (id: string) => {
    router.push(`/history-trip/${id}`);
  };

  return (
    <main className="relative px-5 py-4">
      {/* 뒤로가기 버튼 */}
      <BackButton />

      {/* 설명 문구 */}
<p className="mt-2 text-[24px] font-bold leading-[34px] text-[#111111]">
  추가와 수정이 자유로운
  <br />
  여행 게시판!
</p>

      {/* 카드 리스트 영역 */}
      <section className="mt-4 space-y-3">
        {/* 여행 데이터 목록 */}
        {historyTrips.map((trip) => (
          <div
            key={trip.id}
            // 카드 클릭 시 상세 이동
            onClick={() => handleCardClick(trip.id)}
            // 카드 디자인
            className="
              flex
              h-[60px]              
              cursor-pointer
              items-center
              justify-between
              rounded-[999px]
              border
              border-[#F5F7FA]
              bg-[#F5F7FA]
              px-[20px]
              transition
              hover:bg-[#ECEFF3]
            "
          >
            {/* 제목 */}
            <p className="truncate text-[16px] font-[600] text-[#111111]">
              {trip.title}
            </p>

            {/* 오른쪽 화살표 */}
            <span className="text-[24px] font-[300] leading-none text-[#111111]">
              ›
            </span>
          </div>
        ))}

        {/* 데이터 없을 때 */}
        {historyTrips.length === 0 && (
          <div className="rounded-2xl bg-white py-10 text-center text-sm text-gray-400 shadow-sm">
            지난 여행 데이터가 없어요 🥲
          </div>
        )}
      </section>

      {/* 추가 버튼 */}
      <MainButton
        onClick={() => router.push("/history-trip/new")}
        className="
          absolute
          left-[24px]
          right-[24px]
          top-[530px]
          h-[54px]
          rounded-[12px]
        "
      >
        추가
      </MainButton>
    </main>
  );
}