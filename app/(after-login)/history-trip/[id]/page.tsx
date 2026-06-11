"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

// 화면에서 사용할 여행 상세 타입
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

  // URL의 여행 ID
  const tripId = params.id as string;

  // 화면 데이터
  const [tripDetail, setTripDetail] = useState<TripDetail | null>(null);

  // 취소 시 되돌릴 원본 데이터
  const [originTripDetail, setOriginTripDetail] =
    useState<TripDetail | null>(null);

  // 로그인 사용자 정보
  const loginUserId =
    typeof window !== "undefined"
      ? localStorage.getItem("loginUserId") ?? ""
      : "";

  const loginUserName =
    typeof window !== "undefined"
      ? localStorage.getItem("loginUserName") ?? ""
      : "";

  // 내 글이면 삭제 가능
  const canDelete = tripDetail?.createdId === loginUserId;

  // Firebase Timestamp를 화면용 문자열로 변환
  const formatDateTime = (value: any) => {
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

  // "\n" 문자 줄바꿈 처리
  const convertNewLine = (text: string) => {
    return text.replace(/\\n/g, "\n");
  };

  // 지출 합계 계산
  const calculateTotalExpense = (text: string) => {
    return convertNewLine(text)
      .split("\n")
      .map((line) => {
        const amountText = line.split("-")[1]?.trim() ?? "";

        if (amountText.includes("만원")) {
          const value = Number(amountText.replace("만원", "").trim());
          return value * 10000;
        }

        if (amountText.includes("만")) {
          const value = Number(amountText.replace("만", "").trim());
          return value * 10000;
        }

        return Number(amountText.replaceAll(",", "").trim());
      })
      .filter((value) => !isNaN(value))
      .reduce((sum, value) => sum + value, 0);
  };

  // 날짜 입력 자동 포맷
  const formatDateInput = (value: string) => {
    const onlyNumber = value.replace(/[^0-9]/g, "").slice(0, 8);

    if (onlyNumber.length <= 4) {
      return onlyNumber;
    }

    if (onlyNumber.length <= 6) {
      return `${onlyNumber.slice(0, 4)}-${onlyNumber.slice(4)}`;
    }

    return `${onlyNumber.slice(0, 4)}-${onlyNumber.slice(4, 6)}-${onlyNumber.slice(6)}`;
  };
  // 기존 데이터에 이름이 없을 때만 ele_user에서 조회
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

  // 화면 최초 진입 시 여행 상세 조회
  useEffect(() => {
    const getTripDetail = async () => {

      // 신규 추가 화면이면 Firebase 조회하지 않고 빈값 세팅
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

      // 새 데이터는 crName/modName 사용
      // 예전 데이터는 crID/modID로 사용자 조회
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

  const tripRef = doc(db, "ele_trip", tripId);

  // 수정/추가 버튼
  const handleUpdate = async () => {
    if (!tripDetail) return;

    // 제목 체크
    if (!tripDetail.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    // 날짜 체크
    if (!tripDetail.startDate || !tripDetail.endDate) {
      alert("여행 날짜를 선택해주세요.");
      return;
    }

    // 신규 추가
    if (tripId === "new") {
      // 여행 데이터 추가
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

        // 등록자
        crID: loginUserId,
        crName: loginUserName,
        crDT: serverTimestamp(),

        // 수정자
        modID: loginUserId,
        modName: loginUserName,
        modDT: serverTimestamp(),
      });

      // 지출 데이터 추가
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

    // 기존 수정
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

  // 취소 버튼
  const handleCancel = () => {
    const isConfirm = confirm(
      "작성 중인 내용이 저장되지 않을 수 있어요.\n취소하시겠어요?"
    );

    if (!isConfirm) return;

    router.back();
  };

  // 삭제버튼 (등록자만 삭제 가능)
  const handleDelete = async () => {
    if (!tripDetail) return;

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

      {/* 구분 영역 */}
      <SectionDivider />

      <section className="mt-4 bg-white">
        <div className="mb-5">
          <div className="mb-2">
            <span className="label-text">제목 </span>
            <span className="required-star"> * </span>
          </div>

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
        </div>

        <div className="mb-5">
          <span className="label-text">날짜 </span>
          <span className="required-star"> * </span>

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
        </div>

        <div className="mb-5">
          <span className="label-text">숙소/장소</span>

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
        </div>

        {/* 구분 영역 */}
        <SectionDivider />

        <div className="mb-5">
          <span className="label-text">내용</span>

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
        </div>

        <div className="mb-5">
          <span className="label-text">준비물</span>

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
        </div>

        <div className="mb-5">
          <span className="label-text">지출내용</span>
          <span className="label-desc">(예. 항목-금액 / 콤마없이)</span>

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
            className="form-textarea"
          />
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

          {/* 저장 / 추가 */}
          <button
            onClick={handleUpdate}
            className="flex-1 h-[54px] rounded-[8px] bg-[#1C70D7] text-sm font-bold text-white"
          >
            {tripId === "new" ? "추가" : "저장"}
          </button>

          {/* 삭제 */}
          {/* {tripId !== "new" && canDelete && (
            <button
              onClick={handleDelete}
              className="h-[54px] rounded-[8px] bg-[#FFEAEA] px-5 text-sm font-bold text-[#FF4D4F]"
            >
              삭제
            </button>
          )} */}

          {/* 취소 */}
          <button
            onClick={() => router.push("/history-trip")}
            className="flex-1 h-[54px] rounded-[8px] bg-[#F5F7FA] text-sm font-bold text-[#191919]"
          >
            취소
          </button>

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