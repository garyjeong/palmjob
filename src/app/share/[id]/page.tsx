import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/atoms";
import { getBaseUrl } from "@/utils/getBaseUrl";

// 결과 데이터 가져오기
async function getResult(id: string) {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/result/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

// 동적 메타데이터 생성 (OG 태그 최적화)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getResult(id);

  const baseUrl = await getBaseUrl();
  const ogImageUrl = `${baseUrl}/api/og/${id}`;

  if (!result?.job) {
    return {
      title: "PalmJob - 손금으로 찾는 나만의 이색 직업",
      description: "손바닥 사진으로 나만의 이색 직업을 찾아보세요!",
      openGraph: {
        images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      },
    };
  }

  return {
    title: `${result.job.title} - PalmJob`,
    description: `손금으로 찾은 이색 직업: ${result.job.title}. ${result.job.shortComment || ""} 나도 해보기!`,
    openGraph: {
      title: `🖐️ ${result.job.title} - PalmJob`,
      description: `손금으로 찾은 이색 직업! ${result.job.shortComment || "나도 해보기!"}`,
      type: "website",
      locale: "ko_KR",
      siteName: "PalmJob",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `🖐️ ${result.job.title} - PalmJob`,
      description: `손금으로 찾은 이색 직업! ${result.job.shortComment || "나도 해보기!"}`,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getResult(id);

  // 결과가 없거나 만료됨
  if (!result?.job) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-7xl animate-float">⏰</div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              결과가 만료되었어요
            </h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              결과는 30일 동안만 보관됩니다.
              <br />
              직접 손금을 분석해 보세요!
            </p>
          </div>

          <Link href="/" className="block">
            <Button size="lg" fullWidth>
              나도 해보기 🖐️
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col">
      {/* 헤더 */}
      <header className="px-4 py-4 text-center border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <Link href="/" className="inline-block">
          <h1 className="text-lg font-bold text-[var(--color-text-primary)]">
            🖐️ PalmJob
          </h1>
        </Link>
      </header>

      {/* 결과 콘텐츠 */}
      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-md space-y-6">
          {/* 친구의 결과 안내 */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
              <span>👀</span>
              <span className="text-sm font-medium">친구의 손금 결과</span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              친구가 발견한 이색 직업은
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
                {/* DALL-E 생성 이미지 - Next.js Image로 최적화 */}
                <Image
                  src={result.job.cardImageUrl}
                  alt={result.job.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 448px"
                  className="object-cover"
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                {/* 오버레이 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
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
            <div className="relative h-full flex flex-col items-center justify-center p-6 text-center z-20">
              {/* DALL-E 이미지가 없을 때만 이모지 표시 */}
              {!result.job.cardImageUrl && (
                <div className="text-7xl mb-4 animate-float">
                  {getJobEmoji(result.job.title)}
                </div>
              )}

              {/* 직업 타이틀 */}
              <h3 className={`text-2xl font-bold mb-2 ${result.job.cardImageUrl ? "text-white drop-shadow-lg mt-auto" : "text-[var(--color-text-primary)]"}`}>
                {result.job.title}
              </h3>

              {/* 짧은 코멘트 */}
              {result.job.shortComment && (
                <p className={`text-sm px-4 py-2 rounded-full ${result.job.cardImageUrl ? "text-white/90 bg-black/30" : "text-[var(--color-text-secondary)] bg-[var(--color-surface)]/80"}`}>
                  {result.job.shortComment}
                </p>
              )}
            </div>

            {/* 브랜드 워터마크 */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className={`text-xs px-3 py-1 rounded-full ${result.job.cardImageUrl ? "text-white/80 bg-black/30" : "text-[var(--color-text-muted)] bg-[var(--color-surface)]/60"}`}>
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

          {/* CTA 섹션 */}
          <div className="p-5 bg-gradient-to-r from-[var(--color-primary-50)] to-[var(--color-secondary)]/10 rounded-[var(--radius-xl)] text-center space-y-4">
            <p className="font-semibold text-[var(--color-text-primary)]">
              나는 어떤 직업이 나올까? 🤔
            </p>
            <Link href="/" className="block">
              <Button size="lg" fullWidth>
                나도 해보기 🖐️✨
              </Button>
            </Link>
          </div>

          {/* 안내 문구 */}
          <p className="text-xs text-center text-[var(--color-text-muted)]">
            손바닥 사진으로 나만의 이색 직업을 찾아보세요!
            <br />
            🔒 사진은 분석 후 즉시 삭제됩니다
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
