"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

import BackButton from "@/app/components/common/BackButton";
import PageLayout from "@/app/components/common/PageLayout";
import MainButton from "@/app/components/common/MainButton";

type VoteOption = {
  id: string;
  text: string;
};

export default function VoteEditPage() {
  const params = useParams();
  const router = useRouter();

  const voteId = params.id as string;

  const [title, setTitle] = useState("");
  const [startDT, setStartDT] = useState("");
  const [endDT, setEndDT] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isMultiple, setIsMultiple] = useState(false);
  const [allowAddOption, setAllowAddOption] = useState(false);
  const [isExecutiveOnly, setIsExecutiveOnly] = useState(false);
  const [options, setOptions] = useState<VoteOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getVote = async () => {
      try {
        const docRef = doc(db, "ele_vote", voteId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("투표 정보가 없습니다.");
          router.back();
          return;
        }

        const data = docSnap.data();

        setTitle(data.title ?? "");
        setStartDT(data.startDT ?? "");
        setEndDT(data.endDT ?? "");
        setIsAnonymous(data.isAnonymous ?? false);
        setIsMultiple(data.isMultiple ?? false);
        setAllowAddOption(data.allowAddOption ?? false);
        setIsExecutiveOnly(data.isExecutiveOnly ?? false);
        setOptions(data.options ?? []);
      } catch (error) {
        console.error(error);
        alert("투표 조회 실패");
      } finally {
        setLoading(false);
      }
    };

    getVote();
  }, [voteId, router]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        id: crypto.randomUUID(),
        text: "",
      },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      alert("투표 항목은 최소 2개 이상이어야 합니다.");
      return;
    }

    setOptions(options.filter((_, optionIndex) => optionIndex !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!startDT || !endDT) {
      alert("투표 기간을 입력해주세요.");
      return;
    }

    if (options.length < 2) {
      alert("투표 항목은 최소 2개 이상이어야 합니다.");
      return;
    }

    if (options.some((option) => !option.text.trim())) {
      alert("투표 항목을 입력해주세요.");
      return;
    }

    try {
      await updateDoc(doc(db, "ele_vote", voteId), {
        title,
        startDT,
        endDT,
        isAnonymous,
        isMultiple,
        allowAddOption,
        isExecutiveOnly,
        options,
        modID: localStorage.getItem("loginUserId") ?? "",
        modName: localStorage.getItem("loginUserName") ?? "",
        modDT: serverTimestamp(),
      });

      alert("수정 완료");
      router.push(`/vote/${voteId}`);
    } catch (error) {
      console.error(error);
      alert("수정 실패");
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <BackButton />
        <p className="mt-6 text-sm text-gray-500">불러오는 중...</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <BackButton />

      <p className="title-24 mb-6">투표 수정</p>

      <div className="mb-5">
        <div className="mb-2">
          <span className="label-text">제목</span>
          <span className="required-star"> *</span>
        </div>

        <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" />
      </div>

      <div className="mb-5">
        <div className="mb-2">
          <span className="label-text">시작일</span>
          <span className="required-star"> *</span>
        </div>

        <input type="date" value={startDT} onChange={(e) => setStartDT(e.target.value)} className="form-input" />
      </div>

      <div className="mb-5">
        <div className="mb-2">
          <span className="label-text">종료일</span>
          <span className="required-star"> *</span>
        </div>

        <input type="date" value={endDT} onChange={(e) => setEndDT(e.target.value)} className="form-input" />
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <label className="flex items-center gap-2 body-15">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          익명투표
        </label>

        <label className="flex items-center gap-2 body-15">
          <input type="checkbox" checked={isMultiple} onChange={(e) => setIsMultiple(e.target.checked)} />
          복수선택 가능
        </label>

        <label className="flex items-center gap-2 body-15">
          <input type="checkbox" checked={allowAddOption} onChange={(e) => setAllowAddOption(e.target.checked)} />
          항목 추가 허용
        </label>

        <label className="flex items-center gap-2 body-15">
          <input type="checkbox" checked={isExecutiveOnly} onChange={(e) => setIsExecutiveOnly(e.target.checked)} />
          집행부 전용
        </label>
      </div>

      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <span className="label-text">투표 항목</span>
            <span className="required-star"> *</span>
          </div>

          <button type="button" onClick={handleAddOption} className="caption-13-bold text-[#1C70D7]">
            + 항목 추가
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {options.map((option, index) => (
            <div key={option.id} className="flex gap-2">
              <input value={option.text} onChange={(e) => handleOptionChange(index, e.target.value)} className="form-input flex-1" />

              <button type="button" onClick={() => handleRemoveOption(index)} 
                      className="whitespace-nowrap rounded-[8px] bg-gray-100 px-3 caption-13-bold text-gray-500">
                삭제
              </button>
            </div>
          ))}
        </div>
      </div>

      <MainButton onClick={handleSave} className="w-full">
        저장
      </MainButton>
    </PageLayout>
  );
}