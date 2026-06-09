"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Megaphone, ChevronRight } from "lucide-react";

// Firebase
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";

type Trip = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
};

type Notice = {
  id: string;
  title: string;
  isNotice: boolean;
};

export default function Home() {
  const [activeVoteCount, setActiveVoteCount] = useState(0);   // 투표 건 수 가져오기

  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [noticeList, setNoticeList] = useState<Notice[]>([]);

  useEffect(() => {
    const getTrips = async () => {
      const querySnapshot = await getDocs(
        query(
          collection(db, "ele_trip"),
          orderBy("startDate", "asc")
        )
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tripList: Trip[] = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            title: data.title ?? "",
            startDate: data.startDate ?? "",
            endDate: data.endDate ?? "",
          };
        })
        // 오늘 이후 여행만
        .filter((trip) => {
          return new Date(trip.startDate) >= today;
        });

      setUpcomingTrips(tripList);
    };

    const getNotices = async () => {
      const querySnapshot = await getDocs(
        query(collection(db, "ele_notice"), orderBy("modDT", "desc"))
      );

      const notices: Notice[] = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            title: data.title ?? "",
            isNotice: data.isNotice ?? false,
          };
        })
        .filter((notice) => notice.isNotice);

      setNoticeList(notices);
    };

    // 진행중 투표 개수 조회
    const getVoteCount = async () => {
      const today = new Date().toISOString().slice(0, 10);

      const voteQuery = query(
        collection(db, "ele_vote"),
        where("status", "==", "active"),
        where("is_deleted", "==", false)
      );

      const querySnapshot = await getDocs(voteQuery);

      const activeVotes = querySnapshot.docs.filter((docItem) => {
        const data = docItem.data();

        return data.endDT >= today;
      });

      setActiveVoteCount(activeVotes.length);
    };

    getTrips();
    getNotices();
    getVoteCount();
  }, []);

  return (
    <main className="px-5 py-4">
      {/* 공지사항 */}
      {noticeList.length > 0 && (
        <section className="mb-4 space-y-1">
          {noticeList.map((notice) => (
            <div
              key={notice.id}
              className="flex items-center justify-between rounded-[20px] bg-[#1C70D7] px-4 py-3"
            >
              {/* 공지 제목 */}
              <div className="flex items-center gap-[4px] text-[12px] font-medium leading-[140%] tracking-[-0.025em] text-[#FFFFFF]">
                <Megaphone size={14} strokeWidth={2} fill="#FFFFFF" />
                <span>{notice.title}</span>
              </div>

              {/* 공지 보러가기 버튼 */}
              <Link
                href={`/notice/${notice.id}`}
                className="flex items-center gap-[2px] text-[12px] font-medium leading-[140%] tracking-[-0.025em] text-[#FFFFFF]"
              >
                <span>공지보기</span>
                <ChevronRight size={14} strokeWidth={2} />
              </Link>
            </div>
          ))}
        </section>
      )}

      {/* 현재 계획중인 여행 */}
      <section className="mb-8">
        {upcomingTrips.length > 0 ? (
          <div className="space-y-2">
            {upcomingTrips.map((trip) => {

              // 오늘 날짜
              const today = new Date();

              // 여행 시작일
              const startDate = new Date(trip.startDate);

              // 날짜 차이 계산
              const diffTime =
                startDate.getTime() - today.getTime();

              // D-day 계산
              const dday = Math.ceil(
                diffTime / (1000 * 60 * 60 * 24)
              );

              return (
                <Link
                  key={trip.id}
                  href={`/history-trip/${trip.id}`}
                  className="block"
                >
                  <div
                    className="relative h-[108px] cursor-pointer rounded-[16px] border border-[#7E7E7E]/20 bg-[#FFFFFF]"
                  >
                    <p className="absolute left-[12px] top-[20px] text-[14px] font-semibold text-[#1C70D7]">
                      현재 계획중인 여행
                    </p>

                    <div className="absolute right-[24px] top-[24px] rounded-full bg-[#FFE6C4] px-[12px] py-[4px] text-[12px] font-bold text-[#FF9500]">
                      D-{dday}
                    </div>

                    <h2 className="absolute left-[12px] top-[40px] title-24 text-[#0D1B3E]">
                      {trip.title}
                    </h2>

                    <p className="absolute left-[16px] top-[76px] text-[12px] text-[#8B95A1]">
                      {trip.startDate} ~ {trip.endDate}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-pink-50 bg-white/40 p-8 text-center text-gray-400">
            현재 계획된 여행이 없어요.
          </div>
        )}
      </section>

      <div className="mt-6 grid w-fit grid-cols-2 gap-4">
        <Link
          href="/history-trip"
          className="bg-[#F5F7FA] text-[#000000] rounded-[16px] font-semibold 
           w-32 h-32 flex items-center justify-center text-sm text-center"
        >
          여행
        </Link>

        <Link
          href="/notice"
          className="bg-[#F5F7FA] text-[#000000] rounded-[16px] font-semibold
          w-32 h-32 flex items-center justify-center text-sm text-center"
        >
          공지사항
        </Link>

        <Link
          href="/board"
          className="bg-[#F5F7FA] text-[#000000] rounded-[16px] font-semibold
          w-32 h-32 flex items-center justify-center text-sm text-center"
        >
          한줄대화
        </Link>

        <Link
          href="/vote"
          className="bg-[#F5F7FA] text-[#000000] rounded-[16px] font-semibold
          w-32 h-32 flex items-center justify-center text-sm text-center"
        >
          <div>
            <p>
              투표 {activeVoteCount > 0 ? `(${activeVoteCount}건)` : ""}
            </p>
          </div>
        </Link>
      </div>
    </main>
  );
}