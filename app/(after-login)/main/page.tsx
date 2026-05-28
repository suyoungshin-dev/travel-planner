import Link from "next/link";

export default function Home() {

  const hasCurrentTrip = true; /*여행 유무 확인*/

    const currentTrip = hasCurrentTrip
    ? {
        title: "2026 여행",
        date: "2026-10-17 ~ 2026-10-18",
        location: "미정",
        notice: "단체티 여부 논의 중 / 차량 협의 예정",
        }
    : null;

  return (
    <main className="p-10">

      <section className="mb-8">
        {currentTrip ? (
          <Link href="/trip?mode=view">
            <div className="cursor-pointer rounded-2xl bg-white/70 p-5 shadow-md hover:bg-white">
                <p className="text-sm text-pink-600 font-semibold">
                현재 계획중인 여행
                </p>
                <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {currentTrip.title}
                </h2>
                <p className="mt-2 text-gray-700">{currentTrip.date}</p>
                <p className="text-gray-700">{currentTrip.location}</p>
                <p className="mt-4 text-gray-600">{currentTrip.notice}</p>
            </div>
            </Link>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-pink-50 bg-white/40 p-8 text-center text-gray-400">
            현재 계획된 여행이 없어요.
          </div>
        )}
      </section>

      <div className="flex flex-col gap-4 items-start">
        <Link href="/trip?mode=new">
          <button className="bg-pink-500 text-white px-6 py-3 rounded-2xl shadow-md hover:bg-blue-600 font-semibold">
            여행 추가하기
          </button>
        </Link>

        <Link href="/history-trip">
          <button className="bg-pink-500 text-white px-6 py-3 rounded-2xl shadow-md hover:bg-blue-600 font-semibold">
            지난 여행보기
          </button>
        </Link>
      </div>
    </main>
  );
}