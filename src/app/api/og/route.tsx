import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

// 이미지 크기 (SNS 권장)
const WIDTH = 1200;
const HEIGHT = 630;

export async function GET() {
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
        {/* 메인 타이틀 */}
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

        {/* 서브타이틀 */}
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
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}

