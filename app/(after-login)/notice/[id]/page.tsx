"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BackButton from "@/app/components/BackButton";

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

type NoticeDetail = {
  title: string;
  comment: string;
  isNotice: boolean;
  createdName: string;
  modifiedName: string;
  modifiedAt: string;
  createdId: string;
};

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();

  const noticeId = params.id as string;

  const [noticeDetail, setNoticeDetail] = useState<NoticeDetail | null>(null);
  const [originNoticeDetail, setOriginNoticeDetail] =
    useState<NoticeDetail | null>(null);

  const loginUserId =
    typeof window !== "undefined"
      ? localStorage.getItem("loginUserId") ?? ""
      : "";

  const isWriter = loginUserId === noticeDetail?.createdId;

  const loginUserName =
    typeof window !== "undefined"
      ? localStorage.getItem("loginUserName") ?? ""
      : "";

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

  const convertNewLine = (text: string) => {
    return text.replace(/\\n/g, "\n");
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
    const getNoticeDetail = async () => {
      if (noticeId === "new") {
        const emptyDetail: NoticeDetail = {
          title: "",
          comment: "",
          isNotice: false,
          createdName: loginUserName,
          modifiedName: loginUserName,
          modifiedAt: "",
          createdId: "",
        };

        setNoticeDetail(emptyDetail);
        setOriginNoticeDetail(emptyDetail);
        return;
      }

      const noticeRef = doc(db, "ele_notice", noticeId);
      const noticeSnap = await getDoc(noticeRef);

      if (!noticeSnap.exists()) return;

      const noticeData = noticeSnap.data();

      const createdName =
        noticeData.crName ?? (await getUserName(noticeData.crID));

      const modifiedName =
        noticeData.modName ?? (await getUserName(noticeData.modID));

      const detail: NoticeDetail = {
        title: noticeData.title ?? "",
        comment: convertNewLine(noticeData.comment ?? ""),
        isNotice: noticeData.isNotice ?? false,
        createdName,
        modifiedName,
        modifiedAt: formatDateTime(noticeData.modDT),
        createdId: noticeData.crID ?? "",
      };

      setNoticeDetail(detail);
      setOriginNoticeDetail(detail);
    };

    getNoticeDetail();
  }, [noticeId]);

  const handleUpdate = async () => {
    if (!noticeDetail) return;

    if (!noticeDetail.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (noticeId === "new") {
      const newNoticeRef = doc(collection(db, "ele_notice"));
      const newNoticeId = `notice_${newNoticeRef.id}`;

      await setDoc(doc(db, "ele_notice", newNoticeId), {
        title: noticeDetail.title,
        comment: noticeDetail.comment,
        isNotice: noticeDetail.isNotice,

        crID: loginUserId,
        crName: loginUserName,
        crDT: serverTimestamp(),

        modID: loginUserId,
        modName: loginUserName,
        modDT: serverTimestamp(),
      });

      alert("추가 완료!");
      router.push("/notice");
      return;
    }

    if (!isWriter) {
      alert("작성자만 수정할 수 있어요.");
      return;
    }

    await updateDoc(doc(db, "ele_notice", noticeId), {
      title: noticeDetail.title,
      comment: noticeDetail.comment,
      isNotice: noticeDetail.isNotice,

      modID: loginUserId,
      modName: loginUserName,
      modDT: serverTimestamp(),
    });

    alert("수정 완료!");
    router.back();
  };

  const handleCancel = () => {
    const isConfirm = confirm(
      "작성 중인 내용이 저장되지 않을 수 있어요.\n취소하시겠어요?"
    );

    if (!isConfirm) return;

    if (originNoticeDetail) {
      setNoticeDetail(originNoticeDetail);
    }

    router.back();
  };

  const handleDelete = async () => {
    if (!noticeDetail) return;

    const isConfirm = confirm("정말 삭제하시겠어요?");

    if (!isConfirm) return;

    await deleteDoc(doc(db, "ele_notice", noticeId));

    alert("삭제 완료!");
    router.push("/notice");
  };

  if (!noticeDetail) {
    return (
      <main className="px-5 py-4">
        <BackButton />
        <p className="mt-4 text-sm text-gray-400">
          데이터를 불러오는 중이에요...
        </p>
      </main>
    );
  }

  return (
    <main className="px-5 py-4">
      <BackButton />


      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-sm font-bold text-gray-500">제목</span>
            <span className="text-xs font-bold text-red-400">*</span>

            <label className="ml-auto flex items-center gap-1 text-sm text-gray-500">
              <input
                type="checkbox"
                checked={noticeDetail.isNotice}
                disabled={!isWriter && noticeId !== "new"}
                onChange={(e) =>
                  setNoticeDetail({
                    ...noticeDetail,
                    isNotice: e.target.checked,
                  })
                }
              />
              공지
            </label>
          </div>

          <input
            value={noticeDetail.title}
            readOnly={!isWriter && noticeId !== "new"}
            onChange={(e) =>
              setNoticeDetail({
                ...noticeDetail,
                title: e.target.value,
              })
            }
            className={`w-full rounded-xl border border-pink-200 px-4 py-3 ${!isWriter && noticeId !== "new"
              ? "bg-gray-100 text-gray-500"
              : "bg-white"
              }`}
          />
        </div>

        <div className="mb-5">
          <span className="text-sm font-bold text-gray-500">내용</span>

          <textarea
            value={noticeDetail.comment}
            readOnly={!isWriter && noticeId !== "new"}
            onChange={(e) =>
              setNoticeDetail({
                ...noticeDetail,
                comment: e.target.value,
              })
            }
            className={`h-64 w-full resize-none rounded-xl border border-pink-200 px-4 py-3 ${!isWriter && noticeId !== "new"
                ? "bg-gray-100 text-gray-500"
                : "bg-white"
              }`}
          />
        </div>

        <div className="mt-6 flex gap-3">
          {(noticeId === "new" || isWriter) && (
            <button
              onClick={handleUpdate}
              className="flex-1 rounded-xl bg-pink-500 py-3 text-sm font-bold text-white"
            >
              {noticeId === "new" ? "추가" : "저장"}
            </button>
          )}

          {noticeId !== "new" && isWriter && (
            <button
              onClick={handleDelete}
              className="flex-1 rounded-xl bg-red-400 py-3 text-sm font-bold text-white"
            >
              삭제
            </button>
          )}

          {noticeId !== "new" && isWriter && (
            <button
              onClick={handleDelete}
              className="flex-1 rounded-xl bg-red-400 py-3 text-sm font-bold text-white"
            >
              취소
            </button>
          )}
        </div>

        <hr className="my-5 border-gray-200" />

        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <span className="font-bold text-gray-500">최종수정일시 : </span>
            {noticeDetail.modifiedAt}
          </div>

          <div>
            <span className="font-bold text-gray-500">등록자 : </span>
            {noticeDetail.createdName}
          </div>
        </div>
      </section>
    </main>
  );
}