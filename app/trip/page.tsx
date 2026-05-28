"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TripPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const router = useRouter();

  const isNewMode = mode === "new";

  const currentTrip = {
    title: "2026 여행",
    startDate: "2026-10-17",
    endDate: "2026-10-18",
    location: "미정",
    notice: "단체티 여부 논의 중 / 차량 협의 예정",
  };

  const initialDate = isNewMode ? new Date(): new Date(currentTrip.startDate);

  const [currentDate, setCurrentDate] = useState(initialDate);

  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>
  (
    isNewMode ? new Date() : new Date(currentTrip.startDate)
  );

  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>
  (
    isNewMode
      ? new Date(new Date().setDate(new Date().getDate() + 1))
      : new Date(currentTrip.endDate)
  );
  const [tripTitle, setTripTitle] = useState
  (
    isNewMode ? "" : currentTrip.title
  );

  const [tripLocation, setTripLocation] = useState
  (
    isNewMode ? "" : currentTrip.location
  );

  const [tripNotice, setTripNotice] = useState
  (
    isNewMode ? "" : currentTrip.notice
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number | null) => {
    if (day === null) {
      return;
    }

    if (!isNewMode) {
      return;
    }

    const startDate = new Date(year, month, day);
    const endDate = new Date(year, month, day + 1);

    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
  };

  const handleAddTrip = () => {
    alert("여행이 추가되었어요!");
    router.push("/main");
  };

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= lastDate; day++) {
    days.push(day);
  }

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

      return day >= selectedStartDate.getDate() && day <= selectedEndDate.getDate();
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
      {/* 상단 화면 타이틀 영역 */}
      <div className="mb-5 rounded-2xl bg-white/50 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">📌</span>

          <h2 className="text-lg font-bold text-pink-700">
            {isNewMode ? "여행 추가하기" : "다가오는 여행"}
          </h2>
        </div>

        {!isNewMode &&
          (
            <p className="mt-2 text-sm text-gray-400">
              수정은 집행부에게 문의하세요.
            </p>
          )}
      </div>

      {/* 달력 영역 */}
      <section className="rounded-2xl bg-white/70 p-5 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={handlePrevMonth} className="rounded-xl bg-pink-100 px-3 py-1 text-pink-700 hover:bg-pink-200">
            ←
          </button>

          <h2 className="text-xl font-bold text-gray-800">
            {year}년 {month + 1}월
          </h2>

          <button onClick={handleNextMonth} className="rounded-xl bg-pink-100 px-3 py-1 text-pink-700 hover:bg-pink-200">
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="font-semibold text-pink-600">
              {day}
            </div>
          ))}

          {days.map((day, index) =>
          (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={`rounded-xl py-3 ${day && isTripDay(day) ? "bg-pink-500 font-bold text-white" : "bg-pink-50 text-gray-700"} 
              ${isNewMode && day && !isTripDay(day) ? "cursor-pointer hover:bg-pink-100" : ""}`}>
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
              ? `${selectedStartDate.toISOString().slice(0, 10)} ~ ${selectedEndDate.toISOString().slice(0, 10)}`
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
      {isNewMode ?
        (
          <div className="mt-6 flex gap-3">
            <button onClick={handleAddTrip} className="rounded-2xl bg-pink-500 px-6 py-3 font-semibold text-white shadow-md hover:bg-pink-600">
              추가
            </button>

            <button onClick={() => router.push("/main")} className="rounded-2xl bg-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-300">
              취소
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <button onClick={() => 
              {
                setTripTitle("");
                setTripLocation("");
                setTripNotice("");

                setSelectedStartDate(new Date());

                setSelectedEndDate(
                  new Date(new Date().setDate(new Date().getDate() + 1))
                );

                setCurrentDate(new Date());

                router.push("/trip?mode=new");
              }}className="rounded-2xl bg-pink-500 px-6 py-3 font-semibold text-white shadow-md hover:bg-pink-600">
              신규 추가
            </button>
          </div>          
        )}
    </main>
  );
}