"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.startsWith("/history-trip")) return "여행";
    if (pathname.startsWith("/notice")) return "공지";
    if (pathname.startsWith("/board")) return "한줄대화";
    if (pathname.startsWith("/vote")) return "투표";
    if (pathname.startsWith("/admin")) return "관리자";

    return "";
  };

  const displayTitle = getTitle();

  return (
    <div className="relative mb-[8px] h-[56px] w-full">
      <button
        type="button"
        onClick={() => router.back()}
        className="
          absolute left-[11px] top-[19px]
          flex h-[18px] w-[18px]
          items-center justify-center
          text-[#111111]
        "
      >
        <ChevronLeft size={28} strokeWidth={1.5} />
      </button>

      {displayTitle && (
        <div className="pointer-events-none absolute left-0 top-0 flex h-[56px] w-full items-center justify-center">
          <span className="text-[15px] font-medium leading-[18px] text-[#111111]">
            {displayTitle}
          </span>
        </div>
      )}
    </div>
  );
}