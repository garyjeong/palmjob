"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Spinner } from "@/components/atoms";
import { AnalysisResult } from "@/types";

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 결과 데이터 로드
  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/result/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "결과를 불러올 수 없습니다.");
        }

        if (data.status === "analyzing") {
          router.push(`/analyzing/${id}`);
          return;
        }

        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [id, router]);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/share/${id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `PalmJob - ${result?.job?.title}`,
          text: `내 손금으로 찾은 이색 직업: ${result?.job?.title} 🖐️✨`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  }, [id, result?.job?.title]);

  const handleRetry = useCallback(() => {
    router.push("/");
  }, [router]);

  if (isLoading) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  if (error || !result?.job) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">😢</div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              결과를 찾을 수 없어요
            </h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              {error || "결과가 만료되었거나 존재하지 않습니다."}
            </p>
          </div>
          <Button onClick={handleRetry} size="lg">
            새로 분석하기
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col">
      {/* 헤더 */}
      <header className="px-4 py-4 text-center border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <h1 className="text-lg font-bold text-[var(--color-text-primary)]">
          🖐️ PalmJob
        </h1>
      </header>

      {/* 결과 콘텐츠 */}
      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-md space-y-6">
          {/* 축하 메시지 */}
          <div className="text-center space-y-2">
            <p className="text-sm text-[var(--color-text-secondary)]">
              ✨ 당신에게 어울리는 이색 직업은
            </p>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
              {result.job.title}
            </h2>
          </div>

          {/* 결과 카드 */}
          <div className="relative aspect-[3/4] rounded-[var(--radius-2xl)] overflow-hidden shadow-[var(--shadow-lg)]">
            {/* DALL-E 이미지가 있으면 표시, 없으면 기본 배경 */}
            {result.job.cardImageUrl ? (
              <>
                {/* DALL-E 생성 이미지 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.job.cardImageUrl}
                  alt={result.job.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* 오버레이 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </>
            ) : (
              <>
                {/* 배경 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 via-[var(--color-secondary)]/10 to-[var(--color-accent)]/20" />
                
                {/* 손금 패턴 */}
                <div className="absolute inset-0 palm-pattern opacity-20" />
                
                {/* 글로우 효과 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--color-primary)]/20 rounded-full blur-3xl" />
              </>
            )}
            
            {/* 카드 내용 */}
            <div className={`relative h-full flex flex-col p-6 text-center ${
              result.job.cardImageUrl 
                ? "justify-end pb-20" // DALL-E 이미지가 있을 때: 하단 정렬, 워터마크 공간 확보
                : "justify-center pb-16" // DALL-E 이미지가 없을 때: 중앙 정렬, 워터마크 공간 확보
            }`}>
              {/* DALL-E 이미지가 없을 때만 이모지 표시 */}
              {!result.job.cardImageUrl && (
                <div className="text-7xl mb-4 animate-float">
                  {getJobEmoji(result.job.title)}
                </div>
              )}
              
              {/* 직업 타이틀 */}
              <h3 className={`text-2xl font-bold mb-2 ${
                result.job.cardImageUrl 
                  ? "text-white drop-shadow-lg" 
                  : "text-[var(--color-text-primary)]"
              }`}>
                {result.job.title}
              </h3>
              
              {/* 짧은 코멘트 */}
              {result.job.shortComment && (
                <p className={`text-sm px-4 py-2 rounded-full ${
                  result.job.cardImageUrl 
                    ? "text-white/90 bg-black/30" 
                    : "text-[var(--color-text-secondary)] bg-[var(--color-surface)]/80"
                }`}>
                  {result.job.shortComment}
                </p>
              )}
            </div>
            
            {/* 브랜드 워터마크 */}
            <div className="absolute bottom-4 left-0 right-0 text-center z-10 pointer-events-none">
              <span className={`text-xs px-3 py-1 rounded-full ${
                result.job.cardImageUrl 
                  ? "text-white/80 bg-black/30" 
                  : "text-[var(--color-text-muted)] bg-[var(--color-surface)]/60"
              }`}>
                🖐️ PalmJob
              </span>
            </div>
          </div>

          {/* 해석 문장 */}
          <div className="p-5 bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔮</span>
              <span className="font-semibold text-[var(--color-primary)]">
                손금 해석
              </span>
            </div>
            <p className="text-[var(--color-text-primary)] whitespace-pre-line leading-relaxed">
              {result.job.interpretation}
            </p>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            <Button onClick={handleShare} size="lg" fullWidth>
              {isCopied ? "링크가 복사되었어요! ✓" : "친구에게 공유하기 🔗"}
            </Button>

            <Button onClick={handleRetry} variant="outline" size="lg" fullWidth>
              다시 해보기
            </Button>
          </div>

          {/* 안내 문구 */}
          <p className="text-xs text-center text-[var(--color-text-muted)]">
            📅 결과는 30일 동안 보관됩니다
          </p>
        </div>
      </div>
    </main>
  );
}

// 직업에 맞는 이모지 반환
function getJobEmoji(title: string): string {
  const emojiMap: Record<string, string> = {
    "우주 쓰레기 수거원": "🚀",
    "감정 대리인": "😊",
    "잠 테스터": "😴",
    "인공지능 트레이너": "🤖",
    "미래학자": "🔮",
    "디지털 장례사": "💾",
    "고양이 카페 주인": "🐱",
    "구름 관찰가": "☁️",
    "보드게임 디자이너": "🎲",
    "식물 대화 전문가": "🌱",
  };

  return emojiMap[title] || "✨";
}
