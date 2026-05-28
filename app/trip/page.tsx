"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function TripPage() {
  // URL에서 mode 값 가져오기 (예: /trip?mode=new  ||  /trip?mode=view )
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  // 신규 등록 화면 여부
  const isNewMode = mode === "new";

  // 테스트용 여행 데이터  ** 나중에는 DB에서 조회할 예정
  const currentTrip =
  {
    title: "2026 여행",
    startDate: "2026-10-17",
    endDate: "2026-10-18",
    location: "미정",
    notice: "단체티 여부 논의 중 / 차량 협의 예정",
  };

  // 선택한 여행 시작일
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(
    isNewMode ? new Date() : new Date(currentTrip.startDate)
  );

  // 선택한 여행 종료일
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(
    isNewMode ? new Date(new Date().setDate(new Date().getDate() + 1)) : new Date(currentTrip.endDate)
  );

  // 신규 등록이면 오늘 날짜 기준, 조회 화면이면 여행 시작일 기준
  const initialDate = isNewMode
    ? new Date()
    : new Date(currentTrip.startDate);

  // 현재 달력에 표시할 날짜
  const [currentDate, setCurrentDate] = useState(initialDate);

  // 현재 달력의 년/월
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 이전 달 이동
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 다음 달 이동
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };


  // 날짜 클릭 이벤트
  const handleDateClick = (day: number | null) => {
    // 빈칸 클릭 방지
    if (day === null) {
      return;
    }

    // 조회 모드에서는 클릭 이벤트 실행 안 함
    if (!isNewMode) {
      return;
    }

    // 선택한 날짜
    const startDate = new Date(year, month, day);

    // 기본 1박 2일이므로 다음날을 종료일로 설정
    const endDate = new Date(year, month, day + 1);

    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
  };

  // 해당 월의 1일이 무슨 요일인지
  const firstDay = new Date(year, month, 1).getDay();

  // 해당 월의 마지막 날짜
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 달력에 표시할 날짜 배열
  const days: (number | null)[] = [];

  // 1일 시작 전 빈 칸 추가
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // 실제 날짜 추가
  for (let day = 1; day <= lastDate; day++) {
    days.push(day);
  }

  // 여행 기간에 해당하는 날짜인지 확인 / 달력에서 강조 표시할 날짜인지 확인
  const isTripDay = (day: number) => {
    // 신규 등록 화면에서는 선택한 날짜 범위를 표시
    if (isNewMode) {
      if (selectedStartDate === null || selectedEndDate === null) {
        return false;
      }

      const isSameYear = year === selectedStartDate.getFullYear();
      const isSameMonth = month === selectedStartDate.getMonth();

      if (!isSameYear || !isSameMonth) {
        return false;
      }

      const start = selectedStartDate.getDate();
      const end = selectedEndDate.getDate();

      return day >= start && day <= end;
    }

    // 조회 화면에서는 저장된 여행 날짜 범위를 표시
    const tripStart = new Date(currentTrip.startDate);
    const tripEnd = new Date(currentTrip.endDate);

    const isTripYear = year === tripStart.getFullYear();
    const isTripMonth = month === tripStart.getMonth();

    if (!isTripYear || !isTripMonth) {
      return false;
    }

    const start = tripStart.getDate();
    const end = tripEnd.getDate();

    return day >= start && day <= end;
  };

  return (
    <main className="p-10">
      {/* 상단 화면 타이틀 영역 */}
      <div className="mb-5 rounded-2xl bg-white/50 p-4 shadow-sm">

        {/* 화면 제목 */}
        <div className="flex items-center gap-2">
          <span className="text-lg">📌</span>

          <h2 className="text-lg font-bold text-pink-700">
            {isNewMode ? "여행 추가하기" : "다가오는 여행"}
          </h2>
        </div>

        {/* 안내 문구 */}
        {!isNewMode && (
          <p className="mt-2 text-sm text-gray-400">
            수정은 집행부에게 문의하세요.
          </p>
        )}
      </div>

      {/* 달력 영역 */}
      <section className="rounded-2xl bg-white/70 p-5 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          {/* 이전달 버튼 */}
          <button
            onClick={handlePrevMonth}
            className="rounded-xl bg-pink-100 px-3 py-1 text-pink-700 hover:bg-pink-200"
          >
            ←
          </button>

          {/* 현재 월 */}
          <h2 className="text-xl font-bold text-gray-800">
            {year}년 {month + 1}월
          </h2>

          {/* 다음달 버튼 */}
          <button
            onClick={handleNextMonth}
            className="rounded-xl bg-pink-100 px-3 py-1 text-pink-700 hover:bg-pink-200"
          >
            →
          </button>
        </div>

        {/* 요일 + 날짜 */}
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {/* 요일 표시 */}
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div
              key={day}
              className="font-semibold text-pink-600"
            >
              {day}
            </div>
          ))}

          {/* 날짜 표시 */}
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
        {/* 여행 날짜 */}
        <label className="block text-sm font-semibold text-gray-700">
          여행 날짜
        </label>

        <input
          disabled
          value={
            selectedStartDate && selectedEndDate
              ? `${selectedStartDate.toISOString().slice(0, 10)} ~ ${selectedEndDate.toISOString().slice(0, 10)}`
              : ""
          }
          className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-100"
        />

        {/* 여행명 */}
        <label className="block text-sm font-semibold text-gray-700">
          여행명
        </label>

        <input
          disabled={!isNewMode}
          defaultValue={isNewMode ? "" : currentTrip.title}
          className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-100"
        />

        {/* 장소 */}
        <label className="mt-4 block text-sm font-semibold text-gray-700">
          장소
        </label>

        <input
          disabled={!isNewMode}
          defaultValue={isNewMode ? "" : currentTrip.location}
          className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-100"
        />

        {/* 공지사항 */}
        <label className="mt-4 block text-sm font-semibold text-gray-700">
          공지사항
        </label>

        <textarea
          disabled={!isNewMode}
          defaultValue={isNewMode ? "" : currentTrip.notice}
          className="mt-2 w-full rounded-xl border border-pink-200 px-4 py-3 disabled:bg-gray-100"
        />
      </section>

      {/* 신규 등록 화면일 때 추가/취소 버튼 표시 */}
      {isNewMode ? (
        <div className="mt-6 flex gap-3">
          <button className="rounded-2xl bg-pink-500 px-6 py-3 font-semibold text-white shadow-md hover:bg-pink-600">
            추가
          </button>

          <button className="rounded-2xl bg-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-300">
            취소
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <button className="rounded-2xl bg-pink-500 px-6 py-3 font-semibold text-white shadow-md hover:bg-pink-600">
            추가
          </button>
        </div>
      )}
    </main>
  );
}