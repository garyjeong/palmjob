import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return new Response("ID is required", { status: 400 });
    }

    // Edge Runtime에서는 fetch API로 결과 데이터 가져오기
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://palm.gary-world.app";
    let job = null;
    
    try {
      const response = await fetch(`${baseUrl}/api/result/${id}`, {
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        const data = await response.json();
        job = data?.job;
      }
    } catch (fetchError) {
      console.error("Failed to fetch result:", fetchError);
    }

    // 결과가 없거나 직업 정보가 없는 경우 기본 이미지
    const title = job?.title || "나만의 이색 직업";
    const shortComment = job?.shortComment || "손금으로 찾아보세요!";
    const emoji = getJobEmoji(title);

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
            position: "relative",
          }}
        >
          {/* 직업 이모지 + 직업명 */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
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
              fontWeight: 700,
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
