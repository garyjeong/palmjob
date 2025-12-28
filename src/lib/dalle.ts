/**
 * DALL-E 이미지 생성
 *
 * 직업에 맞는 캐릭터/일러스트 이미지를 생성합니다.
 * 표준 프롬프트 템플릿 + 직업명 대입 구조
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/images/generations";

/**
 * 이미지 생성 결과
 */
export interface GenerateImageResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * 직업 캐릭터 이미지 생성을 위한 표준 프롬프트 템플릿
 *
 * 스타일: 귀여운 3D 캐릭터 일러스트
 * 배경: 손금 패턴이 있는 보라색 그라데이션
 * 구성: 직업을 상징하는 도구/의상을 가진 캐릭터
 */
const PROMPT_TEMPLATE = `Create a magical and whimsical 3D character illustration for "{JOB_TITLE}".

Visual Style:
- Pixar/Disney-inspired 3D character design
- Soft, dreamy lighting with magical glow effects
- Purple-to-pink gradient background with subtle sparkles
- Palm line patterns subtly integrated into the background as decorative elements
- Square composition (1:1 ratio)

Character Design:
- Friendly, approachable character with warm expression
- Wearing stylized outfit or uniform that represents the job
- Holding or surrounded by symbolic tools/objects of the profession
- Slight floating or magical pose to convey whimsy
- Big expressive eyes with a gentle smile

Atmosphere:
- Mystical and enchanting mood
- Soft particle effects like stars or floating lights
- Clean, professional quality suitable for social media cards
- No text or letters in the image

The character should embody the essence of "{JOB_TITLE}" in a creative, fantastical way that feels both unique and universally appealing.`;

/**
 * 직업 캐릭터 이미지 생성
 *
 * @param jobTitle - 직업명 (한글)
 * @returns 생성된 이미지 URL
 */
export async function generateJobImage(
  jobTitle: string
): Promise<GenerateImageResult> {
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set");
    return {
      success: false,
      error: "AI 서비스 설정이 필요합니다.",
    };
  }

  try {
    // 프롬프트 생성 (직업명 대입)
    const prompt = PROMPT_TEMPLATE.replace(/\{JOB_TITLE\}/g, jobTitle);

    console.log(`Generating image for job: ${jobTitle}`);

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("DALL-E API error:", errorData);
      return {
        success: false,
        error: "이미지 생성 중 오류가 발생했습니다.",
      };
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return {
        success: false,
        error: "이미지 URL을 받지 못했습니다.",
      };
    }

    console.log(`Image generated successfully for: ${jobTitle}`);

    return {
      success: true,
      imageUrl,
    };
  } catch (error) {
    console.error("generateJobImage error:", error);
    return {
      success: false,
      error: "이미지 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 직업에 맞는 기본 이모지 반환 (DALL-E 실패 시 폴백)
 */
export function getJobEmoji(title: string): string {
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
    "웃음 치료사": "😄",
    "색깔 컨설턴트": "🎨",
    "비밀 기록 보관자": "📜",
    "감성 큐레이터": "💝",
    "아이디어 수확가": "💡",
  };

  return emojiMap[title] || "✨";
}

