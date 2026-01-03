/**
 * OpenAI Vision API 연동
 *
 * 양손 손바닥 이미지를 분석하여 이색 직업을 추천합니다.
 */

import { JobResult, PromptLog } from "@/types";
import { savePromptLog } from "@/lib/redis";
import { readFile } from "node:fs/promises";
import path from "node:path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

type PalmPromptParts = {
  system: string;
  user: string;
};

const PROMPT_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "prompts",
  "palm-analysis.prompt"
);

// 파일 로딩 실패 시를 대비한 폴백(기존 프롬프트와 동일)
const FALLBACK_SYSTEM_PROMPT = `당신은 재미있고 창의적인 손금 해석 전문가입니다. 양손(왼손과 오른손)의 손바닥 사진을 보고 그 사람에게 어울리는 독특한 "이색 직업"을 추천해주세요.

## 손금 해석 가이드
손금에서 보이는 특징들을 창의적으로 해석하세요:
- **생명선**: 에너지, 활력, 삶에 대한 열정
- **두뇌선(지능선)**: 사고방식, 창의성, 문제해결 능력
- **감정선**: 감성, 대인관계, 공감 능력
- **운명선**: 커리어, 인생 방향, 목표 의식
- **손의 모양**: 손가락 길이, 손바닥 크기, 전체적인 비율

## 양손 해석 원칙
- **왼손**: 타고난 잠재력, 내면의 재능, 무의식적 성향
- **오른손**: 현재 발현된 능력, 의식적 노력, 실현된 특성
- 양손의 **차이점**과 **공통점**을 비교하여 더 깊이 있는 해석 제공

## 규칙
1. 손금의 실제 특징(선의 깊이, 길이, 갈래 등)을 언급하며 해석하세요
2. 유머러스하고 긍정적인 톤을 유지하세요
3. 불쾌감을 주는 내용은 절대 금지
4. 매번 **다양하고 독특한** 이색 직업을 추천하세요 (예시에 없는 것도 OK)
5. 해석은 구체적이고 개인화된 느낌을 주세요

## 이색 직업 예시 (참고용, 새로운 직업 창작 권장)
우주 쓰레기 수거원, 감정 대리인, 잠 테스터, AI 트레이너, 미래학자, 디지털 장례사, 구름 관찰가, 보드게임 디자이너, 식물 대화 전문가, 시간 관리 코치, 행운 배달부, 꿈 해석가, 웃음 치료사, 색깔 컨설턴트, 비밀 기록 보관자, 감성 큐레이터, 아이디어 수확가, 향기 설계사, 기억 정리사, 바람 연주가, 별빛 수집가, 무지개 사냥꾼, 여백 디자이너, 침묵 큐레이터, 순간 포착가

## 응답 형식 (JSON만 출력)
{
  "title": "직업명 (한글, 2~6자)",
  "shortComment": "한 줄 코멘트 (10~15자, 이모지 1개 포함)",
  "interpretation": "해석 문장 (2문단, 각 문단 2-3문장)"
}

## interpretation 작성 가이드
- 1문단: 양손의 손금 특징을 구체적으로 언급하며 분석
- 2문단: 분석을 바탕으로 해당 직업이 어울리는 이유 설명
- 따뜻하고 격려하는 톤으로 마무리`;

const FALLBACK_USER_PROMPT = `이 두 손바닥 사진(왼손과 오른손)을 함께 보고 어울리는 이색 직업을 추천해주세요.
첫 번째 이미지는 왼손, 두 번째 이미지는 오른손입니다.
양손의 손금을 종합하여 분석해주세요. JSON 형식으로만 응답하세요.`;

let cachedPalmPromptParts: PalmPromptParts | null = null;

function parsePalmPromptFile(contents: string): PalmPromptParts {
  const systemMarker = "===SYSTEM===";
  const userMarker = "===USER===";
  const systemIdx = contents.indexOf(systemMarker);
  const userIdx = contents.indexOf(userMarker);

  if (systemIdx === -1 || userIdx === -1 || userIdx <= systemIdx) {
    throw new Error(
      "Invalid palm-analysis.prompt format. Expected markers: ===SYSTEM=== and ===USER==="
    );
  }

  const system = contents
    .slice(systemIdx + systemMarker.length, userIdx)
    .trim();
  const user = contents.slice(userIdx + userMarker.length).trim();

  if (!system || !user) {
    throw new Error(
      "Invalid palm-analysis.prompt format. SYSTEM/USER sections must not be empty."
    );
  }

  return { system, user };
}

async function getPalmPromptParts(): Promise<PalmPromptParts> {
  if (cachedPalmPromptParts) return cachedPalmPromptParts;

  try {
    const raw = await readFile(PROMPT_FILE_PATH, "utf8");
    cachedPalmPromptParts = parsePalmPromptFile(raw);
  } catch (error) {
    console.warn(
      `[openai] Failed to read/parse prompt file at ${PROMPT_FILE_PATH}. Using fallback prompts.`,
      error
    );
    cachedPalmPromptParts = {
      system: FALLBACK_SYSTEM_PROMPT,
      user: FALLBACK_USER_PROMPT,
    };
  }

  return cachedPalmPromptParts;
}

export interface AnalyzeImagesResult {
  success: boolean;
  job?: JobResult;
  error?: string;
}

/**
 * 분석 ID를 받아 프롬프트 로그 저장
 */
let currentAnalysisId: string | null = null;

export function setAnalysisId(id: string): void {
  currentAnalysisId = id;
}

/**
 * 양손 손바닥 이미지 분석
 */
export async function analyzeImages(
  leftImageBase64: string,
  rightImageBase64: string
): Promise<AnalyzeImagesResult> {
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set");
    return {
      success: false,
      error: "AI 서비스 설정이 필요합니다.",
    };
  }

  try {
    const { system, user } = await getPalmPromptParts();

    const formatImage = (base64: string) =>
      base64.startsWith("data:")
        ? base64
        : `data:image/jpeg;base64,${base64}`;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: system,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: user,
              },
              {
                type: "image_url",
                image_url: {
                  url: formatImage(leftImageBase64),
                  detail: "low",
                },
              },
              {
                type: "image_url",
                image_url: {
                  url: formatImage(rightImageBase64),
                  detail: "low",
                },
              },
            ],
          },
        ],
        max_tokens: 600,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      
      // 에러 발생 시에도 프롬프트 로그 저장
      if (currentAnalysisId) {
        const promptLog: PromptLog = {
          id: `${currentAnalysisId}:palm_analysis:${Date.now()}`,
          analysisId: currentAnalysisId,
          type: "palm_analysis",
          prompt: {
            system,
            user,
          },
          error: JSON.stringify(errorData),
          metadata: {
            model: "gpt-4o-mini",
            temperature: 0.8,
            maxTokens: 600,
            imageDetail: "low",
            promptLength: system.length + user.length,
          },
          timestamp: new Date().toISOString(),
        };
        
        savePromptLog(promptLog).catch((err) => {
          console.warn("Failed to save error prompt log:", err);
        });
      }
      
      return {
        success: false,
        error: "AI 분석 중 오류가 발생했습니다.",
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: "AI 응답을 받지 못했습니다.",
      };
    }

    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to parse JSON from:", content);
      return {
        success: false,
        error: "결과 파싱에 실패했습니다.",
      };
    }

    const job: JobResult = JSON.parse(jsonMatch[0]);

    // 프롬프트 로그 저장 (디버깅 및 개선용)
    if (currentAnalysisId) {
      const promptLog: PromptLog = {
        id: `${currentAnalysisId}:palm_analysis:${Date.now()}`,
        analysisId: currentAnalysisId,
        type: "palm_analysis",
        prompt: {
          system,
          user,
        },
        response: {
          title: job.title,
          interpretation: job.interpretation,
          shortComment: job.shortComment,
          rawResponse: content, // 원본 응답 저장
        },
        metadata: {
          model: "gpt-4o-mini",
          temperature: 0.8,
          maxTokens: 600,
          imageDetail: "low",
          promptLength: system.length + user.length,
        },
        timestamp: new Date().toISOString(),
      };
      
      // 비동기로 저장 (실패해도 분석 결과에 영향 없음)
      savePromptLog(promptLog).catch((err) => {
        console.warn("Failed to save prompt log:", err);
      });
    }

    return {
      success: true,
      job,
    };
  } catch (error) {
    console.error("analyzeImages error:", error);
    return {
      success: false,
      error: "분석 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 기본 결과 (API 실패 시 대체)
 */
export function getDefaultResult(): JobResult {
  const defaults: JobResult[] = [
    {
      title: "행운 배달부",
      shortComment: "행운을 나눠주는 사람 🍀",
      interpretation:
        "양손의 손금이 모두 밝은 에너지로 가득하네요. 왼손에서는 타고난 긍정의 기운이, 오른손에서는 주변을 밝히는 노력이 보여요.\n\n사람들에게 행운을 배달하는 특별한 직업이 어울려요. 당신이 지나가는 곳마다 좋은 일이 생길 거예요!",
    },
    {
      title: "꿈 해석가",
      shortComment: "밤의 이야기를 읽는 사람 🌙",
      interpretation:
        "왼손의 직관선이 뚜렷하고, 오른손에는 상상력을 나타내는 선들이 교차하고 있어요. 무의식의 세계와 연결되어 있네요.\n\n사람들의 꿈을 해석하고 의미를 찾아주는 직업이 딱이에요. 밤의 이야기를 낮의 지혜로 바꿔주세요!",
    },
    {
      title: "감성 큐레이터",
      shortComment: "마음을 정리하는 사람 💝",
      interpretation:
        "왼손에서 섬세한 감성이, 오른손에서 표현력이 느껴져요. 양손의 조화가 아름다운 균형을 이루고 있네요.\n\n사람들의 감정을 정리하고 아름답게 큐레이션하는 재능이 있어요. 세상의 감성을 모으고 나누는 특별한 존재가 되어보세요!",
    },
  ];

  return defaults[Math.floor(Math.random() * defaults.length)];
}

// 하위 호환성을 위한 단일 이미지 분석 (deprecated)
export async function analyzeImage(
  imageBase64: string,
  hand: "left" | "right"
): Promise<AnalyzeImagesResult> {
  console.warn("analyzeImage is deprecated. Use analyzeImages instead.");
  // 단일 이미지로 분석 시 기본 결과 반환
  return {
    success: true,
    job: getDefaultResult(),
  };
}
