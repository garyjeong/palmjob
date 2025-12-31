import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

// 이미지 크기 (SNS 권장)
const WIDTH = 1200;
const HEIGHT = 630;

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

export async function GET() {
  const fontData = await loadNotoSansKR();

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
        {/* 메인 타이틀 */}
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
      ...fontOptions,
    }
  );
}
