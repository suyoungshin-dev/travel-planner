import BackButton from "@/app/components/BackButton";

type Vote = {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  isAnonymous: boolean;
  options: {
    id: string;
    text: string;
    count: number;
  }[];
};

const votes: Vote[] = [
  {
    id: "3",
    title: "단체티",
    status: "done",
    startDate: "2026-05-01",
    endDate: "2026-05-10",
    isAnonymous: true,
    options: [
      { id: "1", text: "한다", count: 5 },
      { id: "2", text: "안 한다", count: 2 },
      { id: "3", text: "의견 없음", count: 1 },
    ],
  },

  // 공동 1등 테스트용
  {
    id: "4",
    title: "저녁 메뉴",
    status: "done",
    startDate: "2026-05-01",
    endDate: "2026-05-10",
    isAnonymous: false,
    options: [
      { id: "1", text: "돼지", count: 4 },
      { id: "2", text: "소", count: 4 },
      { id: "3", text: "회", count: 1 },
    ],
  },
];

export default async function VoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // URL의 id 가져오기
  const { id } = await params;

  // id에 맞는 투표 찾기
  const vote = votes.find((vote) => vote.id === id);

  // 없는 투표일 경우
  if (!vote) {
    return (
      <main className="px-4 py-3">
        <BackButton />
        <p className="text-gray-500">만드는 중! 데헷</p>
      </main>
    );
  }

  // 전체 투표 수 계산
  const totalCount = vote.options.reduce(
    (sum, option) => sum + option.count,
    0
  );

  // 최고 득표 수 계산
  const maxCount = Math.max(
    ...vote.options.map((option) => option.count)
  );

  return (
    <main className="px-4 py-3">
      <BackButton />

      <h1 className="mb-2 text-2xl font-bold text-gray-800">
        {vote.title}
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        {vote.startDate} ~ {vote.endDate}
      </p>

      <div className="mb-4 rounded-2xl bg-white/70 p-5 shadow-md">
        <p className="font-bold text-gray-800">투표 결과</p>

        <p className="mt-1 text-sm text-gray-500">
          총 {totalCount}표 {vote.isAnonymous ? "·익명투표" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {vote.options.map((option) => {
          // 퍼센트 계산
          const percent =
            totalCount === 0
              ? 0
              : Math.round((option.count / totalCount) * 100);

          // 최고 득표 여부 확인
          // 공동 1등이면 둘 다 true
          const isWinner = option.count === maxCount;

          return (
            <div
              key={option.id}
              className="rounded-2xl bg-white/70 p-5 shadow-md"
            >
              <div className="flex justify-between gap-3">
                <p className="font-bold text-gray-800">
                  {option.text}
                </p>

                <p
                  className={`text-sm font-semibold ${
                    isWinner ? "text-pink-600" : "text-gray-500"
                  }`}
                >
                  {option.count}표
                </p>
              </div>

              <div
                className={`mt-3 h-3 overflow-hidden rounded-full ${
                  isWinner ? "bg-pink-100" : "bg-gray-200"
                }`}
              >
                <div
                  className={`h-full rounded-full ${
                    isWinner ? "bg-pink-500" : "bg-gray-400"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <p className="mt-2 text-right text-sm text-gray-500">
                {percent}%
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}