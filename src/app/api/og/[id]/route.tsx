import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getAnalysis } from "@/lib/redis";

// Node.js Runtime 사용 (Edge에서 localhost fetch 문제 해결)
export const runtime = "nodejs";

// 이미지 크기 (SNS 권장)
const WIDTH = 1200;
const HEIGHT = 630;

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
    "시간 관리 코치": "⏰",
    "행운 배달부": "🍀",
    "꿈 해석가": "🌙",
    "꿈속 여행사": "🌌",
    "웃음 치료사": "😄",
    "색깔 컨설턴트": "🎨",
    "비밀 기록 보관자": "📜",
    "감성 큐레이터": "💝",
    "아이디어 수확가": "💡",
  };

  return emojiMap[title] || "✨";
}

// Noto Sans KR 폰트 로드 (Google Fonts)
async function loadNotoSansKR(): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(
      "https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLTq8H4hfeE.woff2"
    );
    if (response.ok) {
      return await response.arrayBuffer();
    }
  } catch (error) {
    console.error("Failed to load Noto Sans KR font:", error);
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return new Response("ID is required", { status: 400 });
    }

    // Redis에서 직접 결과 데이터 가져오기
    const result = await getAnalysis(id);
    const job = result?.job;

    // 폰트 로드
    const fontData = await loadNotoSansKR();

    // 결과가 없거나 직업 정보가 없는 경우 기본 이미지
    const title = job?.title || "나만의 이색 직업";
    const shortComment = job?.shortComment || "손금으로 찾아보세요!";
    const cardImageUrl = job?.cardImageUrl;
    const emoji = getJobEmoji(title);

    // 폰트 옵션 설정
    const fontOptions = fontData ? {
      fonts: [
        {
          name: "Noto Sans KR",
          data: fontData,
          style: "normal" as const,
          weight: 400 as const,
        },
      ],
    } : {};

    const fontFamily = fontData ? "Noto Sans KR" : "system-ui, sans-serif";

    // cardImageUrl이 있으면 캐릭터 이미지 포함 레이아웃
    if (cardImageUrl) {
      return new ImageResponse(
        (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              padding: 48,
              gap: 48,
              fontFamily,
            }}
          >
            {/* 좌측: 캐릭터 이미지 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cardImageUrl}
                width={480}
                height={480}
                style={{
                  objectFit: "cover",
                  borderRadius: 24,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                }}
              />
            </div>

            {/* 우측: 텍스트 정보 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                flex: 1,
                gap: 16,
              }}
            >
              {/* 직업명 */}
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 400,
                  color: "white",
                  display: "flex",
                  lineHeight: 1.2,
                }}
              >
                {title}
              </div>

              {/* 한 줄 코멘트 */}
              <div
                style={{
                  fontSize: 28,
                  color: "rgba(255,255,255,0.8)",
                  display: "flex",
                  marginTop: 8,
                }}
              >
                {shortComment}
              </div>

              {/* 브랜드 */}
              <div
                style={{
                  fontSize: 24,
                  color: "rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 24,
                }}
              >
                <span>🖐️</span>
                <span>PalmJob</span>
              </div>
            </div>
          </div>
        ),
        {
          width: WIDTH,
          height: HEIGHT,
          ...fontOptions,
        }
      );
    }

    // cardImageUrl이 없으면 기존 텍스트 중심 레이아웃 (폴백)
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            position: "relative",
            fontFamily,
          }}
        >
          {/* 직업 이모지 + 직업명 */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 400,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 32,
            }}
          >
            <span style={{ fontSize: 64 }}>{emoji}</span>
            <span>{title}</span>
          </div>

          {/* 한 줄 코멘트 */}
          <div
            style={{
              fontSize: 32,
              color: "rgba(255,255,255,0.8)",
              display: "flex",
              marginBottom: 48,
            }}
          >
            {shortComment}
          </div>

          {/* 하단 브랜드 */}
          <div
            style={{
              position: "absolute",
              bottom: 48,
              fontSize: 28,
              color: "rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>🖐️</span>
            <span>손금으로 찾는 나만의 이색 직업</span>
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        ...fontOptions,
      }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    
    // 에러 시에도 기본 이미지 반환
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#1a1a2e",
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 400,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 32,
            }}
          >
            <span style={{ fontSize: 64 }}>🖐️</span>
            <span>손금으로 찾는 나만의 이색 직업</span>
          </div>
          <div
            style={{
              fontSize: 36,
              color: "rgba(255,255,255,0.8)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>✨</span>
            <span>AI가 분석하는 손금으로 신기한 직업 추천</span>
          </div>
        </div>
      ),
      { width: WIDTH, height: HEIGHT }
    );
  }
}
