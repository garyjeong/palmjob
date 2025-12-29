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
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* 손바닥 이모지 */}
        <div
          style={{
            fontSize: 140,
            marginBottom: 24,
            display: "flex",
          }}
        >
          🖐️
        </div>

        {/* 타이틀 */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "white",
            textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            marginBottom: 16,
            display: "flex",
          }}
        >
          PalmJob
        </div>

        {/* 서브타이틀 */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.9)",
            background: "rgba(0,0,0,0.2)",
            padding: "16px 40px",
            borderRadius: 50,
            display: "flex",
          }}
        >
          손금으로 찾는 나만의 이색 직업
        </div>

        {/* CTA */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            color: "rgba(255,255,255,0.7)",
            display: "flex",
          }}
        >
          ✨ AI가 분석하는 손금 직업 추천
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}

