"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
    <main className="px-4 py-3">
      {/* 공지사항 */}
      {noticeList.length > 0 && (
        <section className="mb-4 space-y-1">
          {noticeList.map((notice) => (
            <Link
              key={notice.id}
              href={`/notice/${notice.id}`}
              className="block"
            >
              <div className="rounded-xl bg-pink-100 px-4 py-3 text-sm font-medium text-pink-700 shadow-sm hover:bg-pink-200">
                📢 {notice.title}
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* 현재 계획중인 여행 */}
      <section className="mb-8">
        {upcomingTrips.length > 0 ? (
          <div className="space-y-4">
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
                >
                  <div className="cursor-pointer rounded-2xl bg-white/70 p-5 shadow-md hover:bg-white">

                    {/* 상단 영역 */}
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-semibold text-pink-600">
                        현재 계획중인 여행
                      </p>

                      {/* D-day */}
                      <div className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-500">
                        D-{dday}
                      </div>
                    </div>

                    {/* 제목 */}
                    <h2 className="mt-2 text-2xl font-bold text-gray-800">
                      {trip.title}
                    </h2>

                    {/* 여행 날짜 */}
                    <p className="mt-2 text-gray-700">
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
          className="bg-pink-500 text-white rounded-2xl font-semibold shadow-md
          w-32 h-32 flex items-center justify-center text-sm text-center"
        >
          여행
        </Link>

        <Link
          href="/notice"
          className="bg-pink-500 text-white rounded-2xl font-semibold shadow-md
          w-32 h-32 flex items-center justify-center text-sm text-center"
        >
          공지사항
        </Link>

        <Link
          href="/board"
          className="bg-pink-500 text-white rounded-2xl font-semibold shadow-md
          w-32 h-32 flex items-center justify-center text-sm text-center"
        >
          한줄대화
        </Link>

        <Link
          href="/vote"
          className="bg-pink-500 text-white rounded-2xl font-semibold shadow-md
          w-32 h-32 flex items-center justify-center text-sm text-center"
        >
          <div>
            <p>
              투표 {activeVoteCount > 0 ? `(${activeVoteCount}건)` : ""}
            </p>

            {activeVoteCount > 0 && (
              <p className="mt-1 text-[11px] font-normal text-pink-100">
                투표해주세요!
              </p>
            )}
          </div>
        </Link>
      </div>
    </main>
  );
}