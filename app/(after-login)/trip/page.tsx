"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackButton from "@/app/components/BackButton";

/**
 * useSearchParams()는 Vercel 빌드 시 Suspense 안에서 사용해야 해서
 * 실제 화면 내용은 TripPageContent 컴포넌트에 넣어둔다.
 */
function TripPageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const router = useRouter();

  // mode=new 이면 신규 등록 화면, 아니면 기존 여행 조회 화면
  const isNewMode = mode === "new";

  // 현재는 DB가 없어서 임시로 박아둔 여행 데이터
  const currentTrip = {
    title: "2026 여행",
    startDate: "2026-10-17",
    endDate: "2026-10-18",
    location: "미정",
    notice: "단체티 여부 논의 중 / 차량 협의 예정",
  };

  // 신규 추가일 때는 오늘 날짜, 조회일 때는 기존 여행 시작일 기준
  const initialDate = isNewMode ? new Date() : new Date(currentTrip.startDate);

  // 현재 달력에서 보고 있는 년/월
  const [currentDate, setCurrentDate] = useState(initialDate);

  // 선택된 여행 시작일
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(
    isNewMode ? new Date() : new Date(currentTrip.startDate)
  );

  // 선택된 여행 종료일
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(
    isNewMode
      ? new Date(new Date().setDate(new Date().getDate() + 1))
      : new Date(currentTrip.endDate)
  );

  // 여행명 입력값
  const [tripTitle, setTripTitle] = useState(
    isNewMode ? "" : currentTrip.title
  );

  // 장소 입력값
  const [tripLocation, setTripLocation] = useState(
    isNewMode ? "" : currentTrip.location
  );

  // 공지사항 입력값
  const [tripNotice, setTripNotice] = useState(
    isNewMode ? "" : currentTrip.notice
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 이전 달로 이동
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 다음 달로 이동
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 날짜 클릭 시 신규 등록 모드에서만 여행 날짜 선택
  const handleDateClick = (day: number | null) => {
    if (day === null) return;
    if (!isNewMode) return;

    const startDate = new Date(year, month, day);
    const endDate = new Date(year, month, day + 1);

    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
  };

  // 추가 버튼 클릭
  const handleAddTrip = () => {
    alert("여행이 추가되었어요!");
    router.push("/main");
  };

  // 신규 추가 버튼 클릭 시 입력값 초기화 후 신규 등록 모드로 이동
  const handleNewTripClick = () => {
    setTripTitle("");
    setTripLocation("");
    setTripNotice("");

    const today = new Date();
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));

    setSelectedStartDate(today);
    setSelectedEndDate(tomorrow);
    setCurrentDate(today);

    router.push("/trip?mode=new");
  };

  // 달력 첫 주 앞쪽 빈 칸 계산
  const firstDay = new Date(year, month, 1).getDay();

  // 이번 달 마지막 날짜 계산
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 달력에 뿌릴 날짜 배열
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= lastDate; day++) {
    days.push(day);
  }

  // 해당 날짜가 여행 기간에 포함되는지 확인
  const isTripDay = (day: number) => {
    if (isNewMode) {
      if (selectedStartDate === null || selectedEndDate === null) {
        return false;
      }

      const isSameYear = year === selectedStartDate.getFullYear();
      const isSameMonth = month === selectedStartDate.getMonth();

      if (!isSameYear || !isSameMonth) {
        return false;
      }

      return (
        day >= selectedStartDate.getDate() &&
        day <= selectedEndDate.getDate()
      );
    }

    const tripStart = new Date(currentTrip.startDate);
    const tripEnd = new Date(currentTrip.endDate);

    const isTripYear = year === tripStart.getFullYear();
    const isTripMonth = month === tripStart.getMonth();

    if (!isTripYear || !isTripMonth) {
      return false;
    }

    return day >= tripStart.getDate() && day <= tripEnd.getDate();
  };

  return (
    <main className="p-10">
      {/* 뒤로가기 버튼 */}
      <BackButton />

      {/* 상단 화면 타이틀 영역 - 계획된 여행일 때만 표시 */}
      {!isNewMode && (
        <div className="mb-5 rounded-2xl bg-white/50 p-4 shadow-sm">

          <div className="flex items-center gap-2">

            <span className="text-lg">📌</span>

            <p className="text-sm text-gray-700">
              수정은 집행부에게 문의하세요.
            </p>

          </div>
        </div>
      )}

      {/* 달력 영역 */}
      <section className="rounded-2xl bg-white/70 p-5 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="rounded-xl bg-pink-100 px-3 py-1 text-pink-700 hover:bg-pink-200"
          >
            ←
          </button>

          <h2 className="text-xl font-bold text-gray-800">
            {year}년 {month + 1}월
          </h2>

          <button
            onClick={handleNextMonth}
            className="rounded-xl bg-pink-100 px-3 py-1 text-pink-700 hover:bg-pink-200"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="font-semibold text-pink-600">
              {day}
            </div>
          ))}

          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={`rounded-xl py-3 ${day && isTripDay(day)
                ? "bg-pink-500 font-bold text-white"
                : "bg-pink-50 text-gray-700"
                } ${isNewMode && day && !isTripDay(day)
                  ? "cursor-pointer hover:bg-pink-100"
                  : ""
                }`}
            >
              {day}
            </div>
          ))}
        </div>
      </section>

      {/* 여행 정보 입력/조회 영역 */}
      <section className="mt-6 rounded-2xl bg-white/70 p-5 shadow-md">
        <label className="block text-sm font-semibold text-gray-700">
          여행 날짜
        </label>

        <input
          disabled
          value={
            selectedStartDate && selectedEndDate
              ? `${selectedStartDate.toLocaleDateString("sv-SE").slice(0, 10)} ~ ${selectedEndDate
                .toLocaleDateString("sv-SE")
                .slice(0, 10)}`
              : ""
          }
          className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-100"
        />

        <label className="mt-4 block text-sm font-semibold text-gray-700">
          여행명
        </label>

        <input
          disabled={!isNewMode}
          value={tripTitle}
          onChange={(e) => setTripTitle(e.target.value)}
          className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-100"
        />

        <label className="mt-4 block text-sm font-semibold text-gray-700">
          장소
        </label>

        <input
          disabled={!isNewMode}
          value={tripLocation}
          onChange={(e) => setTripLocation(e.target.value)}
          className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-100"
        />

        <label className="mt-4 block text-sm font-semibold text-gray-700">
          공지사항
        </label>

        <textarea
          disabled={!isNewMode}
          value={tripNotice}
          onChange={(e) => setTripNotice(e.target.value)}
          className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-100"
        />
      </section>

      {/* 추가 / 취소 버튼 영역 */}
      {isNewMode ? (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleAddTrip}
            className="rounded-2xl bg-pink-500 px-6 py-3 font-semibold text-white shadow-md hover:bg-pink-600"
          >
            추가
          </button>

          <button
            onClick={() => router.push("/main")}
            className="rounded-2xl bg-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-300"
          >
            취소
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <button
            onClick={handleNewTripClick}
            className="rounded-2xl bg-pink-500 px-6 py-3 font-semibold text-white shadow-md hover:bg-pink-600"
          >
            신규 추가
          </button>
        </div>
      )}
    </main>
  );
}

/**
 * Vercel 배포 에러 방지용 wrapper.
 * TripPageContent 내부에서 useSearchParams()를 쓰기 때문에 Suspense로 감싸야 한다.
 */
export default function TripPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <TripPageContent />
    </Suspense>
  );
}