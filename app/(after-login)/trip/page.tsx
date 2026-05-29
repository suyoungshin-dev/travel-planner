"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackButton from "@/app/components/BackButton";

function TripPageContent() {
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

  const initialDate = isNewMode ? new Date() : new Date(currentTrip.startDate);

  const [currentDate, setCurrentDate] = useState(initialDate);

  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(
    isNewMode ? new Date() : new Date(currentTrip.startDate)
  );

  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(
    isNewMode
      ? new Date(new Date().setDate(new Date().getDate() + 1))
      : new Date(currentTrip.endDate)
  );

  const [activeDateField, setActiveDateField] = useState<"from" | "to">(
    "from"
  );

  const [tripTitle, setTripTitle] = useState(
    isNewMode ? "" : currentTrip.title
  );

  const [tripLocation, setTripLocation] = useState(
    isNewMode ? "" : currentTrip.location
  );

  const [tripNotice, setTripNotice] = useState(
    isNewMode ? "" : currentTrip.notice
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("sv-SE").slice(0, 10);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number | null) => {
    if (day === null) return;
    if (!isNewMode) return;

    const clickedDate = new Date(year, month, day);

    if (activeDateField === "from") {
      const nextDate = new Date(year, month, day + 1);

      setSelectedStartDate(clickedDate);
      setSelectedEndDate(nextDate);
    }

    if (activeDateField === "to") {
      if (selectedStartDate && clickedDate < selectedStartDate) {
        alert("종료일은 시작일보다 빠를 수 없어요.");
        return;
      }

      setSelectedEndDate(clickedDate);
    }
  };

  const handleAddTrip = () => {
    alert("여행이 추가되었어요!");
    router.push("/main");
  };

  const handleNewTripClick = () => {
    setTripTitle("");
    setTripLocation("");
    setTripNotice("");

    const today = new Date();
    const tomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    setSelectedStartDate(today);
    setSelectedEndDate(tomorrow);
    setCurrentDate(today);
    setActiveDateField("from");

    router.push("/trip?mode=new");
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
    if (!selectedStartDate || !selectedEndDate) return false;

    const targetDate = new Date(year, month, day);

    const startDate = new Date(
      selectedStartDate.getFullYear(),
      selectedStartDate.getMonth(),
      selectedStartDate.getDate()
    );

    const endDate = new Date(
      selectedEndDate.getFullYear(),
      selectedEndDate.getMonth(),
      selectedEndDate.getDate()
    );

    return targetDate >= startDate && targetDate <= endDate;
  };

  return (
    <main className="p-10">
      <BackButton />

      <p className="mt-2 text-xs text-gray-500">테스트 화면이랍니다..</p>

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
              className={`rounded-2xl p-4 ${
                day !== null && isTripDay(day)
                  ? "bg-pink-500 text-white"
                  : "bg-pink-50 text-gray-900"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white/70 p-5 shadow-md">
        <label className="block text-sm font-semibold text-gray-700">
          여행 날짜
        </label>

        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <input
            readOnly
            disabled={!isNewMode}
            value={formatDate(selectedStartDate)}
            onClick={() => setActiveDateField("from")}
            className={`w-full rounded-xl border px-4 py-3 disabled:bg-gray-100 ${
              isNewMode && activeDateField === "from"
                ? "border-pink-400 bg-pink-50"
                : "border-pink-200"
            }`}
          />

          <span className="text-gray-400">~</span>

          <input
            readOnly
            disabled={!isNewMode}
            value={formatDate(selectedEndDate)}
            onClick={() => setActiveDateField("to")}
            className={`w-full rounded-xl border px-4 py-3 disabled:bg-gray-100 ${
              isNewMode && activeDateField === "to"
                ? "border-pink-400 bg-pink-50"
                : "border-pink-200"
            }`}
          />
        </div>

        <p className="mt-2 text-xs text-gray-400">
          시작일을 선택하면 기본 1박 2일로 설정! <br />
          종료일을 눌러 날짜를 변경할 수 있어요 🔥
        </p>

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

export default function TripPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading...</div>}>
      <TripPageContent />
    </Suspense>
  );
}