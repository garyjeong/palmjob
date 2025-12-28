"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "@/components/atoms";

const ANALYSIS_MESSAGES = [
  "손금 라인을 분석하고 있어요... 🔍",
  "생명선의 깊이를 측정하고 있어요... 📏",
  "운명선의 방향을 읽고 있어요... 🧭",
  "당신에게 어울리는 직업을 찾고 있어요... 💼",
  "결과 카드를 준비하고 있어요... 🎨",
  "거의 다 됐어요! ✨",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 메시지 순환 및 프로그레스
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ANALYSIS_MESSAGES.length);
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  // 분석 상태 확인 (폴링)
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/result/${id}`);
      const result = await response.json();

      if (response.ok && result.status === "completed") {
        setProgress(100);
        setTimeout(() => {
          router.push(`/result/${id}`);
        }, 500);
      } else if (result.status === "failed") {
        setError(result.error || "분석에 실패했습니다.");
      }
    } catch (err) {
      console.error("Status check failed:", err);
    }
  }, [id, router]);

  useEffect(() => {
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleRetry = () => {
    router.push("/");
  };

  if (error) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">😢</div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              분석에 실패했어요
            </h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-semibold hover:brightness-110 transition-all"
          >
            다시 시도하기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* 로딩 애니메이션 */}
        <div className="relative flex items-center justify-center">
          {/* 외부 링 */}
          <div className="absolute w-32 h-32 rounded-full border-4 border-[var(--color-primary-100)] animate-spin-slow" />
          <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-[var(--color-primary-light)] animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }} />
          
          {/* 중앙 아이콘 */}
          <div className="w-24 h-24 rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-lg)] flex items-center justify-center animate-pulse-glow">
            <span className="text-5xl animate-float">🔮</span>
          </div>
        </div>

        {/* 상태 메시지 */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            손금을 분석하고 있어요
          </h1>
          <p className="text-[var(--color-text-secondary)] min-h-[1.5em]">
            {ANALYSIS_MESSAGES[messageIndex]}
          </p>
        </div>

        {/* 프로그레스 바 */}
        <div className="w-full space-y-2">
          <div className="h-2 bg-[var(--color-primary-100)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            {Math.round(progress)}% 완료
          </p>
        </div>

        {/* 진행 표시 점 */}
        <div className="flex justify-center gap-2">
          {ANALYSIS_MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${
                  i <= messageIndex
                    ? "bg-[var(--color-primary)] scale-110"
                    : "bg-[var(--color-border)]"
                }
              `}
            />
          ))}
        </div>

        {/* 안내 문구 */}
        <p className="text-xs text-[var(--color-text-muted)]">
          잠시만 기다려 주세요, 곧 결과가 나와요! 🎉
        </p>
      </div>
    </main>
  );
}
