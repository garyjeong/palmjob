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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            position: "relative",
          }}
        >
          {/* 손금 패턴 배경 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q35 25, 30 55 M20 10 Q30 30, 25 50 M40 15 Q35 35, 38 45' stroke='white' stroke-width='0.5' fill='none' opacity='0.15'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
              display: "flex",
            }}
          />

          {/* 글로우 효과 */}
          <div
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
              display: "flex",
            }}
          />

          {/* 이모지 */}
          <div
            style={{
              fontSize: 120,
              marginBottom: 20,
              display: "flex",
            }}
          >
            {emoji}
          </div>

          {/* 직업명 */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "white",
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              marginBottom: 16,
              display: "flex",
            }}
          >
            {title}
          </div>

          {/* 한 줄 코멘트 */}
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.9)",
              background: "rgba(0,0,0,0.2)",
              padding: "12px 32px",
              borderRadius: 50,
              display: "flex",
            }}
          >
            {shortComment}
          </div>

          {/* 브랜드 */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              fontSize: 24,
              color: "rgba(255,255,255,0.8)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>🖐️</span>
            <span>PalmJob</span>
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          }}
        >
          <div style={{ fontSize: 100, marginBottom: 20, display: "flex" }}>🖐️</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: "white", display: "flex" }}>
            PalmJob
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.8)", marginTop: 16, display: "flex" }}>
            손금으로 찾는 나만의 이색 직업
          </div>
        </div>
      ),
      { width: WIDTH, height: HEIGHT }
    );
  }
}
