"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/app/components/common/BackButton";
import PageLayout from "@/app/components/common/PageLayout";
import MainButton from "@/app/components/common/MainButtonTemp";
import SubButton from "@/app/components/common/SubButton";

// Firestore에서 컬렉션 조회용 함수들
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function AdminCodePage() {
    const router = useRouter();

    // 현재 DB에 저장된 코드
    const [currentCode, setCurrentCode] = useState("");

    // 입력창에서 수정 중인 코드
    const [newCode, setNewCode] = useState("");

    // 로그인 코드 사용 여부
    const [isUse, setIsUse] = useState(true);

    // 화면 로딩 여부
    const [loading, setLoading] = useState(true);

    // DB 문서 ID 저장용
    // code_001을 하드코딩하지 않기 위해 필요함
    const [codeDocId, setCodeDocId] = useState("");

    useEffect(() => {
        // 화면이 처음 열렸을 때 실행할 함수
        const getCode = async () => {
            // ele_code 컬렉션에서 isUse가 true인 문서 조회
            const q = query(
                collection(db, "ele_code"),
                where("isUse", "==", true)
            );

            const querySnapshot = await getDocs(q);

            // 조회된 문서가 있으면
            if (!querySnapshot.empty) {
                // 첫 번째 문서 사용
                const docItem = querySnapshot.docs[0];
                const data = docItem.data();

                // 나중에 저장할 때 필요해서 문서ID 저장
                setCodeDocId(docItem.id);

                // 현재 코드 표시용
                setCurrentCode(data.code ?? "");

                // 입력값은 빈값으로 변경
                setNewCode("");

                // 사용 여부 세팅
                setIsUse(data.isUse ?? true);
            }

            // DB 조회 끝났으니 로딩 종료
            setLoading(false);
        };

        getCode();
    }, []);

    const handleSave = async () => {
        if (!newCode.trim()) {
            alert("변경할 코드를 입력해주세요.");
            return;
        }

        if (newCode.trim() == currentCode) {
            alert("현재 코드와 변경 코드가 동일합니다.");
            return;
        }

        if (!codeDocId) {
            alert("수정할 코드 문서를 찾지 못했습니다.");
            return;
        }

        if (!confirm("로그인 코드를 변경할까요?")) return;

        // useEffect에서 저장해둔 실제 문서ID로 수정
        const docRef = doc(db, "ele_code", codeDocId);

        await updateDoc(docRef, {
            code: newCode.trim(),
            isUse: isUse,
        });

        alert("로그인 코드가 변경되었습니다.");
        router.back();
    };

    const handleCancel = () => {
        router.back();
    };

    if (loading) {
        return (
            <PageLayout>
                <BackButton />
                <p className="mt-6 text-sm text-gray-400">불러오는 중...</p>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <BackButton />

            <section className="mt-6">
                <h1 className="title-24">
                    로그인 코드 관리
                </h1>

                <div className="mt-6 mb-5">
                    <p className="label-text mb-2">현재코드</p>

                    <div className="rounded-xl bg-[#F5F7FA] px-4 py-3 text-base font-bold text-[#1C70D7]">
                        {currentCode || "-"}
                    </div>
                </div>

                <div className="mb-5">
                    <p className="label-text mb-2">변경코드</p>

                    <input
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-[#1C70D7]"
                        placeholder="변경할 코드를 입력하세요"
                    />
                </div>

                <label className="mb-6 flex items-center gap-2 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        checked={isUse}
                        onChange={(e) => setIsUse(e.target.checked)}
                        className="h-4 w-4 accent-[#1C70D7]"
                    />
                    현재 운영중
                </label>

                <div className="flex gap-2">
                    <MainButton
                        onClick={handleSave}
                        className="flex-1"
                    >
                        저장
                    </MainButton>

                    <SubButton
                        onClick={handleCancel}
                        className="flex-1"
                    >
                        취소
                    </SubButton>
                </div>
            </section>
        </PageLayout>
    );
}