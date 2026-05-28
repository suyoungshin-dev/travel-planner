import Link from "next/link";

export default function Home() {
  return (
    //<main className="min-h-screen bg-pink-50 p-10">
    <main className="min-h-screen bg-gradient-to-b from-pink-100 to-violet-100 p-10">
      <h1 className="text-4xl font-bold text-pink-900 mb-4">
        11-1=0 ✈️
      </h1>

      <p className="text-gray-700 mb-8">
        이번 여행 뭐하지?
      </p>

      <div className="flex flex-col gap-4 items-start">

        <Link href="/add-trip">
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