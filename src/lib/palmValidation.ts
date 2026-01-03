/**
 * 손바닥 이미지 검증
 *
 * OpenAI Vision API를 사용하여 손바닥 이미지의 유효성을 검증합니다.
 * 손바닥 여부, 품질, 손 선택 등을 확인하여 분석 전에 필터링합니다.
 */

import { PalmValidationResult, UploadErrorType, PromptLog } from "@/types";
import { savePromptLog } from "@/lib/redis";
import { readFile } from "node:fs/promises";
import path from "node:path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

type ValidationPromptParts = {
  system: string;
  user: string;
};

const VALIDATION_PROMPT_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "prompts",
  "palm-validation.prompt"
);

// 파일 로딩 실패 시를 대비한 폴백 프롬프트
const FALLBACK_SYSTEM_PROMPT = `당신은 손바닥 이미지 검증 전문가입니다. 업로드된 이미지가 손바닥 사진인지, 품질이 분석 가능한지 검증해주세요.

## 검증 항목
1. 손바닥 여부 확인
2. 손 선택 확인 (왼손/오른손)
3. 이미지 품질 확인 (완전성, 밝기, 선명도, 손금 라인)

## 응답 형식 (JSON만 출력)
{
  "isValid": true/false,
  "errorType": "NOT_PALM" | "PALM_CROPPED" | "TOO_DARK" | "TOO_BLURRY" | "HAND_MISMATCH" | null,
  "details": {
    "isPalm": true/false,
    "isLeftHand": true/false,
    "isRightHand": true/false,
    "isComplete": true/false,
    "isBright": true/false,
    "isClear": true/false,
    "hasPalmLines": true/false
  },
  "message": "검증 결과 설명 (한국어)"
}`;

const FALLBACK_USER_PROMPT = `다음 두 이미지를 검증해주세요:
1. 첫 번째 이미지: 왼손 손바닥이어야 함
2. 두 번째 이미지: 오른손 손바닥이어야 함

각 이미지가 손바닥인지, 품질이 분석 가능한지, 손 선택이 올바른지 확인하고 JSON 형식으로만 응답하세요.`;

let cachedValidationPromptParts: ValidationPromptParts | null = null;

function parseValidationPromptFile(contents: string): ValidationPromptParts {
  const systemMarker = "===SYSTEM===";
  const userMarker = "===USER===";
  const systemIdx = contents.indexOf(systemMarker);
  const userIdx = contents.indexOf(userMarker);

  if (systemIdx === -1 || userIdx === -1 || userIdx <= systemIdx) {
    throw new Error(
      "Invalid palm-validation.prompt format. Expected markers: ===SYSTEM=== and ===USER==="
    );
  }

  const system = contents
    .slice(systemIdx + systemMarker.length, userIdx)
    .trim();
  const user = contents.slice(userIdx + userMarker.length).trim();

  if (!system || !user) {
    throw new Error(
      "Invalid palm-validation.prompt format. SYSTEM/USER sections must not be empty."
    );
  }

  return { system, user };
}

async function getValidationPromptParts(): Promise<ValidationPromptParts> {
  if (cachedValidationPromptParts) return cachedValidationPromptParts;

  try {
    const raw = await readFile(VALIDATION_PROMPT_FILE_PATH, "utf8");
    cachedValidationPromptParts = parseValidationPromptFile(raw);
  } catch (error) {
    console.warn(
      `[palmValidation] Failed to read/parse prompt file at ${VALIDATION_PROMPT_FILE_PATH}. Using fallback prompts.`,
      error
    );
    cachedValidationPromptParts = {
      system: FALLBACK_SYSTEM_PROMPT,
      user: FALLBACK_USER_PROMPT,
    };
  }

  return cachedValidationPromptParts;
}

/**
 * 이미지를 Base64 형식으로 포맷팅
 */
function formatImage(base64: string): string {
  return base64.startsWith("data:")
    ? base64
    : `data:image/jpeg;base64,${base64}`;
}

/**
 * 손바닥 이미지 검증
 *
 * @param leftImageBase64 - 왼손 이미지 (Base64)
 * @param rightImageBase64 - 오른손 이미지 (Base64)
 * @param analysisId - 분석 ID (프롬프트 로그 저장용, 선택적)
 * @returns 검증 결과
 */
export async function validatePalmImages(
  leftImageBase64: string,
  rightImageBase64: string,
  analysisId?: string
): Promise<PalmValidationResult> {
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set");
    return {
      isValid: false,
      errorType: "UNKNOWN",
      message: "AI 서비스 설정이 필요합니다.",
    };
  }

  try {
    const { system, user } = await getValidationPromptParts();

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // 저비용 모델 사용
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
                  detail: "low", // 저해상도로 비용 절감
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
        max_tokens: 200, // 검증만 하므로 토큰 수 최소화
        temperature: 0.3, // 일관된 결과를 위해 낮은 temperature
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI Validation API error:", errorData);
      
      // 에러 발생 시에도 프롬프트 로그 저장
      if (analysisId) {
        const promptLog: PromptLog = {
          id: `${analysisId}:palm_validation:${Date.now()}`,
          analysisId,
          type: "palm_validation",
          prompt: {
            system,
            user,
          },
          error: JSON.stringify(errorData),
          metadata: {
            model: "gpt-4o-mini",
            temperature: 0.3,
            maxTokens: 200,
            imageDetail: "low",
            promptLength: system.length + user.length,
          },
          timestamp: new Date().toISOString(),
        };
        
        savePromptLog(promptLog).catch((err) => {
          console.warn("Failed to save error validation prompt log:", err);
        });
      }
      
      return {
        isValid: false,
        errorType: "UNKNOWN",
        message: "검증 중 오류가 발생했습니다.",
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        isValid: false,
        errorType: "UNKNOWN",
        message: "검증 응답을 받지 못했습니다.",
      };
    }

    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to parse JSON from validation response:", content);
      return {
        isValid: false,
        errorType: "UNKNOWN",
        message: "검증 결과 파싱에 실패했습니다.",
      };
    }

    const validationResult: PalmValidationResult = JSON.parse(jsonMatch[0]);

    // 타입 검증
    if (typeof validationResult.isValid !== "boolean") {
      console.error("Invalid validation result format:", validationResult);
      return {
        isValid: false,
        errorType: "UNKNOWN",
        message: "검증 결과 형식이 올바르지 않습니다.",
      };
    }

    // isValid가 false인데 errorType이 없는 경우 기본값 설정
    if (!validationResult.isValid && !validationResult.errorType) {
      validationResult.errorType = "NOT_PALM";
    }

    // 프롬프트 로그 저장 (디버깅 및 개선용)
    if (analysisId) {
      const promptLog: PromptLog = {
        id: `${analysisId}:palm_validation:${Date.now()}`,
        analysisId,
        type: "palm_validation",
        prompt: {
          system,
          user,
        },
        response: {
          rawResponse: content, // 원본 응답 저장
        },
        metadata: {
          model: "gpt-4o-mini",
          temperature: 0.3,
          maxTokens: 200,
          imageDetail: "low",
          promptLength: system.length + user.length,
        },
        error: !validationResult.isValid ? validationResult.errorType : undefined,
        timestamp: new Date().toISOString(),
      };
      
      // 비동기로 저장 (실패해도 검증 결과에 영향 없음)
      savePromptLog(promptLog).catch((err) => {
        console.warn("Failed to save validation prompt log:", err);
      });
    }

    return validationResult;
  } catch (error) {
    console.error("validatePalmImages error:", error);
    return {
      isValid: false,
      errorType: "UNKNOWN",
      message: "검증 중 오류가 발생했습니다.",
    };
  }
}

