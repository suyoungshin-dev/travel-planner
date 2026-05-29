"use client";

import { useRouter } from "next/navigation";
import { MoveLeft  } from "lucide-react";

// 컴포넌트에서 받을 값 타입
type BackButtonProps = {
  message?: string;
};

export default function BackButton({
  message,
}: BackButtonProps) {

  // 페이지 이동용 Router
  const router = useRouter();

  return (

    /* 뒤로가기 영역 */
    <div className="mb-4 flex items-center gap-3">

      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.back()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-white"
      >
        <MoveLeft size={26} strokeWidth={2.5} />
      </button>

      {/* 안내 문구 */}
      {message && (
        <p className="text-sm text-gray-400">
          {message}
        </p>
      )}

    </div>

  );
}