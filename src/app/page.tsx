"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { DualUploadArea, GenderSelector, ErrorModal } from "@/components/molecules";
import { Gender, UploadErrorType } from "@/types";
import {
  saveUploadData,
  restoreUploadData,
  restoreFilesFromUrls,
  clearUploadData,
  getErrorInfo,
} from "@/utils/storage";

export default function UploadPage() {
  const router = useRouter();
  const [gender, setGender] = useState<Gender | null>(null);
  const [leftImage, setLeftImage] = useState<File | null>(null);
  const [rightImage, setRightImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorType, setErrorType] = useState<UploadErrorType>("UNKNOWN");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 페이지 로드 시 저장된 데이터 복원
  useEffect(() => {
    const stored = restoreUploadData();
    if (stored) {
      setGender(stored.gender);
      
      // Object URL에서 File 객체 복원
      restoreFilesFromUrls(stored.leftImageUrl, stored.rightImageUrl)
        .then((files) => {
          if (files) {
            setLeftImage(files.leftFile);
            setRightImage(files.rightFile);
          }
        })
        .catch((err) => {
          console.error("Failed to restore files:", err);
        });
    }

    // 에러 정보 확인
    const errorInfo = getErrorInfo();
    if (errorInfo) {
      setErrorModalOpen(true);
      setErrorType(errorInfo.errorType);
      setErrorMessage(errorInfo.errorMessage);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!gender || !leftImage || !rightImage) return;

    setIsUploading(true);
    setError(null);

    try {
      // 제출 전에 입력 데이터 저장
      saveUploadData(gender, leftImage, rightImage);

      const formData = new FormData();
      formData.append("gender", gender);
      formData.append("leftImage", leftImage);
      formData.append("rightImage", rightImage);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "분석 중 오류가 발생했습니다.");
      }

      // 성공적으로 분석 시작 시 데이터 삭제
      clearUploadData();

      router.push(`/analyzing/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  }, [gender, leftImage, rightImage, router]);

  const isSubmitDisabled = !gender || !leftImage || !rightImage || isUploading;

  return (
    <main className="min-h-dvh flex flex-col">
      {/* 헤더 영역 */}
      <header className="px-4 py-12 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] bg-clip-text text-transparent">
            PalmJob
          </span>
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]">
          손금으로 찾는 나만의 이색 직업
        </p>
        {/* 카카오 광고 */}
        <div className="mt-4 flex justify-center">
          <ins
            className="kakao_ad_area"
            style={{ display: "none" }}
            data-ad-unit="DAN-aIL4mru17i2g90vg"
            data-ad-width="320"
            data-ad-height="100"
          />
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 px-4 pb-8">
        <div className="mx-auto max-w-md space-y-6">
          {/* 성별 선택 */}
          <section className="glass rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)]">
            <h2 className="mb-4 text-sm font-semibold text-[var(--color-text-secondary)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs">
                1
              </span>
              성별을 선택해주세요
            </h2>
            
            <GenderSelector value={gender} onChange={setGender} />
          </section>

          {/* 양손 사진 업로드 */}
          <section className="glass rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)]">
            <h2 className="mb-4 text-sm font-semibold text-[var(--color-text-secondary)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs">
                2
              </span>
              양손 사진을 올려주세요
            </h2>
            
            <DualUploadArea
              leftImage={leftImage}
              rightImage={rightImage}
              onLeftImageSelect={setLeftImage}
              onRightImageSelect={setRightImage}
            />
          </section>

          {/* 촬영 가이드 */}
          <section className="p-5 bg-[var(--color-primary-50)] rounded-[var(--radius-xl)] border border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-primary)] mb-3 flex items-center gap-2">
              <span>📸</span> 촬영 가이드
            </h3>
            <ul className="text-sm text-[var(--color-text-secondary)] space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-secondary)]">✦</span>
                손바닥 전체가 보이게 촬영해 주세요
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-secondary)]">✦</span>
                밝은 곳에서 촬영하면 더 정확해요
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-secondary)]">✦</span>
                손금이 선명하게 보이도록 펴주세요
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-secondary)]">✦</span>
                <strong>양손 모두</strong> 업로드해야 분석이 시작돼요
              </li>
            </ul>
          </section>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-[var(--radius-lg)] text-sm text-red-600 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            isLoading={isUploading}
            size="lg"
            fullWidth
          >
            {isUploading ? "분석 중..." : "내 직업 찾기 ✨"}
          </Button>

          {/* 개인정보 안내 */}
          <div className="text-center space-y-1">
            <p className="text-xs text-[var(--color-text-muted)]">
              🔒 업로드한 손바닥 사진은 결과 생성 후 즉시 폐기됩니다
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              결과 링크는 30일 동안 유지됩니다
            </p>
          </div>
        </div>
      </div>

      {/* 에러 모달 */}
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errorType={errorType}
        errorMessage={errorMessage}
        onRetry={() => {
          setErrorModalOpen(false);
          // 모달 닫기만 하고, 이미 복원된 데이터로 재시도 가능
        }}
      />
    </main>
  );
}
