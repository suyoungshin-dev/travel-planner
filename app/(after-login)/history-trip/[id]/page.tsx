"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";

import SectionDivider from "@/app/components/common/SectionDivider";
import BackButton from "@/app/components/common/BackButton";
import PageLayout from "@/app/components/common/PageLayout";

import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

type TripDetail = {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  notice: string;
  supplies: string;
  expenseContent: string;
  totalExpense: number;
  isRegular: boolean;
  createdName: string;
  modifiedName: string;
  modifiedAt: string;
  createdId: string;
};

export default function HistoryTripDetailPage() {
  const params = useParams();
  const router = useRouter();

  const tripId = params.id as string;

  const [tripDetail, setTripDetail] = useState<TripDetail | null>(null);
  const [originTripDetail, setOriginTripDetail] =
    useState<TripDetail | null>(null);

  const loginUserId =
    typeof window !== "undefined"
      ? localStorage.getItem("loginUserId") ?? ""
      : "";

  const loginUserName =
    typeof window !== "undefined"
      ? localStorage.getItem("loginUserName") ?? ""
      : "";

  const isWriter = loginUserId === tripDetail?.createdId;
  const isNew = tripId === "new";
  const isEditable = isNew || isWriter;

  const formatDateTime = (value: Timestamp | null | undefined) => {
    if (!value?.toDate) return "";

    const date = value.toDate();

    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const convertNewLine = (text: string) => {
    return text.replace(/\\n/g, "\n");
  };

  const calculateTotalExpense = (text: string) => {
    return convertNewLine(text)
      .split("\n")
      .map((line) => {
        const match = line.match(/-\s*([\d,]+)\s*원\s*$/);

        if (!match) return 0;

        return Number(match[1].replaceAll(",", ""));
      })
      .reduce((sum, value) => sum + value, 0);
  };

  const formatDateInput = (value: string) => {
    const onlyNumber = value.replace(/[^0-9]/g, "").slice(0, 8);

    if (onlyNumber.length <= 4) {
      return onlyNumber;
    }

    if (onlyNumber.length <= 6) {
      return `${onlyNumber.slice(0, 4)}-${onlyNumber.slice(4)}`;
    }

    return `${onlyNumber.slice(0, 4)}-${onlyNumber.slice(
      4,
      6
    )}-${onlyNumber.slice(6)}`;
  };

  const getUserName = async (userId: string) => {
    if (!userId) return "";

    const userRef = doc(db, "ele_user", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return userId;

    const userData = userSnap.data();

    return Array.isArray(userData.user_name)
      ? userData.user_name.join(", ")
      : userId;
  };

  useEffect(() => {
    const getTripDetail = async () => {
      if (tripId === "new") {
        const today = new Date();

        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const formatDate = (date: Date) => date.toISOString().slice(0, 10);

        const emptyDetail: TripDetail = {
          title: "",
          startDate: formatDate(today),
          endDate: formatDate(tomorrow),
          location: "",
          notice: "",
          supplies: "",
          expenseContent: "",
          totalExpense: 0,
          isRegular: false,
          createdName: loginUserName,
          modifiedName: loginUserName,
          modifiedAt: "",
          createdId: "",
        };

        setTripDetail(emptyDetail);
        setOriginTripDetail(emptyDetail);
        return;
      }

      const tripRef = doc(db, "ele_trip", tripId);
      const tripSnap = await getDoc(tripRef);

      if (!tripSnap.exists()) return;

      const tripData = tripSnap.data();

      const payRef = doc(db, "ele_paylist", tripId);
      const paySnap = await getDoc(payRef);
      const payData = paySnap.exists() ? paySnap.data() : null;

      const expenseContent = convertNewLine(payData?.content ?? "");
      const totalExpense = calculateTotalExpense(expenseContent);

      const createdName =
        tripData.crName ?? (await getUserName(tripData.crID));

      const modifiedName =
        tripData.modName ?? (await getUserName(tripData.modID));

      const detail: TripDetail = {
        title: tripData.title ?? "",
        startDate: tripData.startDate ?? "",
        endDate: tripData.endDate ?? "",
        location: tripData.location ?? "",
        notice: convertNewLine(tripData.notice ?? ""),
        supplies: convertNewLine(tripData.supplies ?? ""),
        isRegular: tripData.isRegular ?? false,
        expenseContent,
        totalExpense,
        createdName,
        modifiedName,
        modifiedAt: formatDateTime(tripData.modDT),
        createdId: tripData.crID ?? "",
      };

      setTripDetail(detail);
      setOriginTripDetail(detail);
    };

    getTripDetail();
  }, [tripId]);

  const handleUpdate = async () => {
    if (!tripDetail) return;

    if (!isEditable) {
      alert("등록자만 수정할 수 있어요.");
      return;
    }

    if (!tripDetail.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!tripDetail.startDate || !tripDetail.endDate) {
      alert("여행 날짜를 선택해주세요.");
      return;
    }

    if (tripId === "new") {
      const newTripRef = doc(collection(db, "ele_trip"));
      const newTripId = `trip_${newTripRef.id}`;

      await setDoc(doc(db, "ele_trip", newTripId), {
        title: tripDetail.title,
        startDate: tripDetail.startDate,
        endDate: tripDetail.endDate,
        location: tripDetail.location,
        notice: tripDetail.notice,
        supplies: tripDetail.supplies,
        isRegular: tripDetail.isRegular,

        crID: loginUserId,
        crName: loginUserName,
        crDT: serverTimestamp(),

        modID: loginUserId,
        modName: loginUserName,
        modDT: serverTimestamp(),
      });

      await setDoc(doc(db, "ele_paylist", newTripId), {
        content: tripDetail.expenseContent,

        modID: loginUserId,
        modName: loginUserName,
        modDT: serverTimestamp(),
      });

      alert("추가 완료!");
      router.push("/history-trip");
      return;
    }

    const tripRef = doc(db, "ele_trip", tripId);
    const payRef = doc(db, "ele_paylist", tripId);

    await updateDoc(tripRef, {
      title: tripDetail.title,
      startDate: tripDetail.startDate,
      endDate: tripDetail.endDate,
      location: tripDetail.location,
      notice: tripDetail.notice,
      supplies: tripDetail.supplies,
      isRegular: tripDetail.isRegular,

      modID: loginUserId,
      modName: loginUserName,
      modDT: serverTimestamp(),
    });

    await setDoc(
      payRef,
      {
        content: tripDetail.expenseContent,

        modID: loginUserId,
        modName: loginUserName,
        modDT: serverTimestamp(),
      },
      { merge: true }
    );

    alert("수정 완료!");
    router.back();
  };

  const handleCancel = () => {
    const isConfirm = confirm(
      "작성 중인 내용이 저장되지 않을 수 있어요.\n취소하시겠어요?"
    );

    if (!isConfirm) return;

    if (originTripDetail) {
      setTripDetail(originTripDetail);
    }

    router.back();
  };

  const handleDelete = async () => {
    if (!tripDetail) return;

    if (!isWriter) {
      alert("등록자만 삭제할 수 있어요.");
      return;
    }

    const isConfirm = confirm("정말 삭제하시겠어요?");

    if (!isConfirm) return;

    await deleteDoc(doc(db, "ele_trip", tripId));
    await deleteDoc(doc(db, "ele_paylist", tripId));

    alert("삭제 완료!");
    router.push("/history-trip");
  };

  if (!tripDetail) {
    return (
      <PageLayout>
        <BackButton />
        <p className="mt-4 text-sm text-gray-400">
          데이터를 불러오는 중이에요...
        </p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <BackButton />

      <p className="title-24">
        여행 궁금해요? <br />여길 보세요
      </p>

      <SectionDivider />

      <section className="mt-4 bg-white">
        <div className="mb-5">
          <div className="mb-2">
            <span className="label-text">제목 </span>
            <span className="required-star"> * </span>
          </div>

          {isEditable ? (
            <input
              value={tripDetail.title}
              onChange={(e) =>
                setTripDetail({
                  ...tripDetail,
                  title: e.target.value,
                })
              }
              className="form-input"
            />
          ) : (
            <div className="py-3 text-[20px] font-bold leading-[30px] text-[#111111]">
              {tripDetail.title}
            </div>
          )}
        </div>

        <div className="mb-5">
          <span className="label-text">날짜 </span>
          <span className="required-star"> * </span>

          {isEditable ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={tripDetail.startDate}
                onChange={(e) =>
                  setTripDetail({
                    ...tripDetail,
                    startDate: formatDateInput(e.target.value),
                  })
                }
                className="form-input"
              />

              <span className="text-gray-400">~</span>

              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={tripDetail.endDate}
                onChange={(e) =>
                  setTripDetail({
                    ...tripDetail,
                    endDate: formatDateInput(e.target.value),
                  })
                }
                className="form-input"
              />
            </div>
          ) : (
            <div className="py-3 text-[15px] leading-[24px] text-[#333333]">
              {tripDetail.startDate} ~ {tripDetail.endDate}
            </div>
          )}
        </div>

        <div className="mb-5">
          <span className="label-text">숙소/장소</span>

          {isEditable ? (
            <input
              value={tripDetail.location}
              onChange={(e) =>
                setTripDetail({
                  ...tripDetail,
                  location: e.target.value,
                })
              }
              className="form-input"
            />
          ) : (
            <div className="py-3 text-[15px] leading-[24px] text-[#333333]">
              {tripDetail.location || "-"}
            </div>
          )}
        </div>

        <SectionDivider />

        <div className="mb-5">
          <span className="label-text">내용</span>

          {isEditable ? (
            <textarea
              value={tripDetail.notice}
              onChange={(e) =>
                setTripDetail({
                  ...tripDetail,
                  notice: e.target.value,
                })
              }
              className="form-textarea"
            />
          ) : (
            <div className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-7 text-[#333333]">
              {tripDetail.notice || "-"}
            </div>
          )}
        </div>

        <div className="mb-5">
          <span className="label-text">준비물</span>

          {isEditable ? (
            <textarea
              value={tripDetail.supplies}
              onChange={(e) =>
                setTripDetail({
                  ...tripDetail,
                  supplies: e.target.value,
                })
              }
              className="form-textarea"
            />
          ) : (
            <div className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-7 text-[#333333]">
              {tripDetail.supplies || "-"}
            </div>
          )}
        </div>

        <div className="mb-5">
          <span className="label-text">지출내용</span>
          <span className="label-desc">
            (예. 항목-n,nnn원) 항목-금액 포맷만 계산합니다.
          </span>

          {isEditable ? (
            <textarea
              value={tripDetail.expenseContent}
              onChange={(e) => {
                const expenseContent = e.target.value;

                setTripDetail({
                  ...tripDetail,
                  expenseContent,
                  totalExpense: calculateTotalExpense(expenseContent),
                });
              }}
              className="form-textarea !h-[400px]"
            />
          ) : (
            <div className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-7 text-[#333333]">
              {tripDetail.expenseContent || "-"}
            </div>
          )}
        </div>

        <div className="mt-4">
          <span className="label-text">총 사용금액 </span>

          <input
            value={`${tripDetail.totalExpense.toLocaleString()}원`}
            readOnly
            className="form-input form-input-readonly"
          />
        </div>

        <div className="mt-5 flex gap-3">
          {isEditable && (
            <button
              onClick={handleUpdate}
              className="flex-1 h-[54px] rounded-[8px] bg-[#1C70D7] text-sm font-bold text-white"
            >
              {isNew ? "추가" : "저장"}
            </button>
          )}

          {isEditable && (
            <button
              onClick={handleDelete}
              className="flex-1 h-[54px] rounded-[8px] bg-[#F5F7FA] text-sm font-bold text-[#191919]"
            >
              삭제
            </button>
          )}
        </div>

        <hr className="my-5 border-gray-200" />

        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <span className="font-bold text-gray-500">최종수정일시 : </span>
            {tripDetail.modifiedAt}
          </div>

          <div>
            <span className="font-bold text-gray-500">최종수정자 : </span>
            {tripDetail.modifiedName}
          </div>

          <div>
            <span className="font-bold text-gray-500">등록자 : </span>
            {tripDetail.createdName}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}