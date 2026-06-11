"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/app/lib/firebase";

import BackButton from "@/app/components/common/BackButton";
import PageLayout from "@/app/components/common/PageLayout";
import MainButton from "@/app/components/common/MainButton";

import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

type LoginUser = {
  id: string;
  name: string;
  isLeader: boolean;
  isManager: boolean;
  isEvent: boolean;
};

type VoteOption = {
  id: string;
  text: string;
};

type VoteUser = {
  userId: string;
  userName: string;
  optionIds: string[];
  votedAt?: Timestamp;
};

type Vote = {
  id: string;
  title: string;
  startDT: string;
  endDT: string;
  status: "active" | "done";

  isAnonymous: boolean;
  isMultiple: boolean;
  allowAddOption: boolean;
  isExecutiveOnly: boolean;

  options: VoteOption[];
  voters: VoteUser[];

  crID: string;
  crName: string;
  crDT?: Timestamp;

  modID?: string;
  modName?: string;
  modDT?: Timestamp;

  is_deleted: boolean;
};

export default function VoteDetailPage() {
  const router = useRouter();
  const params = useParams();

  const voteId = params.id as string;

  const [currentUser, setCurrentUser] = useState<LoginUser | null>(null);
  const [vote, setVote] = useState<Vote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  useEffect(() => {
    const loginUserId = localStorage.getItem("loginUserId");
    const loginUserName = localStorage.getItem("loginUserName");
    const isAdmin = localStorage.getItem("isAdmin");

    if (!loginUserId || !loginUserName) {
      router.push("/");
      return;
    }

    setCurrentUser({
      id: loginUserId,
      name: loginUserName,
      isLeader: isAdmin === "Y",
      isManager: isAdmin === "Y",
      isEvent: isAdmin === "Y",
    });
  }, [router]);

  useEffect(() => {
    const getVoteDetail = async () => {
      if (!voteId) return;

      const voteRef = doc(db, "ele_vote", voteId);
      const voteSnap = await getDoc(voteRef);

      if (!voteSnap.exists()) {
        setVote(null);
        setIsLoading(false);
        return;
      }

      const data = voteSnap.data();

      const voteData: Vote = {
        id: voteSnap.id,
        title: data.title ?? "",
        startDT: data.startDT ?? "",
        endDT: data.endDT ?? "",
        status: data.status ?? "active",

        isAnonymous: data.isAnonymous ?? false,
        isMultiple: data.isMultiple ?? false,
        allowAddOption: data.allowAddOption ?? false,
        isExecutiveOnly: data.isExecutiveOnly ?? false,

        options: data.options ?? [],
        voters: data.voters ?? [],

        crID: data.crID ?? "",
        crName: data.crName ?? "",
        crDT: data.crDT,

        modID: data.modID,
        modName: data.modName,
        modDT: data.modDT,

        is_deleted: data.is_deleted ?? false,
      };

      setVote(voteData);
      setIsLoading(false);
    };

    getVoteDetail();
  }, [voteId]);

  useEffect(() => {
    if (!vote || !currentUser) return;

    const myVote = vote.voters.find((voter) => voter.userId === currentUser.id);

    if (myVote) {
      setSelectedOptionIds(myVote.optionIds);
    }
  }, [vote, currentUser]);

  const handleSelectOption = (optionId: string) => {
    if (!vote) return;

    if (vote.isMultiple) {
      if (selectedOptionIds.includes(optionId)) {
        setSelectedOptionIds(selectedOptionIds.filter((id) => id !== optionId));
      } else {
        setSelectedOptionIds([...selectedOptionIds, optionId]);
      }

      return;
    }

    setSelectedOptionIds([optionId]);
  };

  const handleVote = async () => {
    if (!vote || !currentUser) return;

    if (vote.status === "done") {
      alert("이미 완료된 투표입니다.");
      return;
    }

    if (selectedOptionIds.length === 0) {
      alert("투표 항목을 선택해주세요.");
      return;
    }

    const newVoters = [
      ...vote.voters.filter((voter) => voter.userId !== currentUser.id),
      {
        userId: currentUser.id,
        userName: currentUser.name,
        optionIds: selectedOptionIds,
        votedAt: Timestamp.now(),
      },
    ];

    await updateDoc(doc(db, "ele_vote", vote.id), {
      voters: newVoters,
      modID: currentUser.id,
      modName: currentUser.name,
      modDT: serverTimestamp(),
    });

    setVote({
      ...vote,
      voters: newVoters,
      modID: currentUser.id,
      modName: currentUser.name,
    });

    alert("투표가 저장되었습니다.");
  };

  const handleDone = async () => {
    if (!vote || !currentUser) return;

    if (!confirm("투표를 완료 처리할까요? 완료 후에는 기록 보기만 가능합니다.")) {
      return;
    }

    await updateDoc(doc(db, "ele_vote", vote.id), {
      status: "done",
      modID: currentUser.id,
      modName: currentUser.name,
      modDT: serverTimestamp(),
    });

    setVote({
      ...vote,
      status: "done",
      modID: currentUser.id,
      modName: currentUser.name,
    });

    alert("투표가 완료 처리되었습니다.");
  };

  const handleDelete = async () => {
    if (!vote) return;

    if (!confirm("투표를 삭제할까요?")) return;

    await deleteDoc(doc(db, "ele_vote", vote.id));

    alert("삭제되었습니다.");
    router.push("/vote");
  };

  const getOptionCount = (optionId: string) => {
    if (!vote) return 0;

    return vote.voters.filter((voter) => voter.optionIds.includes(optionId)).length;
  };

  const getOptionVoterNames = (optionId: string) => {
    if (!vote) return [];

    return vote.voters
      .filter((voter) => voter.optionIds.includes(optionId))
      .map((voter) => voter.userName);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <BackButton />
        <p className="mt-6 text-sm text-gray-500">불러오는 중...</p>
      </PageLayout>
    );
  }

  if (!vote || vote.is_deleted) {
    return (
      <PageLayout>
        <BackButton />
        <p className="mt-6 text-sm text-gray-500">투표를 찾을 수 없습니다.</p>
      </PageLayout>
    );
  }

  if (!currentUser) return null;

  const isOwner = vote.crID === currentUser.id;
  const isDone = vote.status === "done";
  const myVote = vote.voters.find((voter) => voter.userId === currentUser.id);
  const isVoted = !!myVote;

  const totalVoteCount = vote.options.reduce(
    (sum, option) => sum + getOptionCount(option.id),
    0
  );

  const maxCount = Math.max(
    0,
    ...vote.options.map((option) => getOptionCount(option.id))
  );

  return (
    <PageLayout>
      <BackButton />

      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="mb-5">
          <h1 className="text-xl font-extrabold text-gray-900">{vote.title}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span>{vote.startDT.slice(2)}</span>
            <span>~</span>
            <span>{vote.endDT.slice(2)}</span>

            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isDone ? "status-badge-gray" : "status-badge"}`}>
              {isDone ? "완료" : "진행중"}
            </span>
          </div>

          <p className="mt-1 text-xs text-gray-400">등록자: {vote.crName}</p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && !isDone && (
            <button onClick={() => router.push(`/vote/${vote.id}/edit`)} className="shrink-0 rounded-lg bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600">
              수정
            </button>
          )}
          {isOwner && !isDone && (
            <button onClick={handleDone} className="shrink-0 rounded-lg bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600">
              완료
            </button>
          )}

          {isOwner && (
            <button onClick={handleDelete} className="shrink-0 rounded-lg bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600">
              삭제
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="mt-1 flex flex-wrap gap-2 caption-13 text-gray-400">
          {vote.isAnonymous && <span>익명투표</span>}
          {vote.isMultiple && <span>복수선택 가능</span>}
          {vote.isMultiple && <span>총 {totalVoteCount}표</span>}
        </div>

        {!isDone && isVoted && (
          <p className="mt-1 rounded-[8px] bg-[#EEF5FF] px-3 py-2 caption-13 text-[#1C70D7]">
            이미 투표했어요. 다시 선택 후 저장하면 변경됩니다.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {vote.options.map((option) => {
          const count = getOptionCount(option.id);
          const percent = totalVoteCount === 0 ? 0 : Math.round((count / totalVoteCount) * 100);
          const isSelected = selectedOptionIds.includes(option.id);
          const isWinner = isDone && count > 0 && count === maxCount;
          const voterNames = getOptionVoterNames(option.id);

          return (
            <button key={option.id} onClick={() => !isDone && handleSelectOption(option.id)} disabled={isDone} className={`border-b border-gray-200 py-4 text-left transition ${isSelected && !isDone ? "bg-[#F8FBFF]" : "bg-white"}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="body-15-bold">
                  {isSelected && !isDone && <span className="mr-1 text-[#1C70D7]">✓</span>}
                  {option.text}
                </p>

                <p className={isWinner ? "label-text" : "caption-13-bold"}>
                  {count}표
                </p>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                <div className={`h-full rounded-full ${isWinner ? "bg-[#1C70D7]" : "bg-gray-400"}`} style={{ width: `${percent}%` }} />
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="min-h-5">
                  {!vote.isAnonymous && isVoted && voterNames.length > 0 && (
                    <p className="text-xs text-gray-400">{voterNames.join(", ")}</p>
                  )}

                  {vote.isAnonymous && isVoted && count > 0 && (
                    <p className="text-xs text-gray-400">{count}명이 선택했어요.</p>
                  )}
                </div>

                <p className="text-xs font-bold text-gray-400">{percent}%</p>
              </div>
            </button>
          );
        })}
      </div>

      {!isDone && (
        <div className="mt-6 flex gap-2">
          <MainButton onClick={handleVote} className="w-full">
            {isVoted ? "다시 투표" : "투표하기"}
          </MainButton>
        </div>
      )}
    </PageLayout>
  );
}