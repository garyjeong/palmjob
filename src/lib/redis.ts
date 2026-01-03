/**
 * Redis 저장소
 *
 * 로컬: Docker Redis (ioredis)
 * 프로덕션: Fly.io Redis 또는 Upstash
 * 30일 후 자동 만료 (TTL)
 */

import Redis from "ioredis";
import { AnalysisResult, AnalysisStatus, JobResult, PromptLog } from "@/types";

// Redis 클라이언트 (싱글톤)
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      console.error("Redis connection failed after 3 retries");
      return null;
    }
    return Math.min(times * 100, 3000);
  },
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("Redis connected");
});

// 키 프리픽스
const KEY_PREFIX = "palmjob:result:";
const PROMPT_LOG_PREFIX = "palmjob:prompt:";
const IMAGE_PREFIX = "palmjob:image:";

// 30일 (초)
const EXPIRY_SECONDS = 30 * 24 * 60 * 60;

/**
 * 분석 요청 생성 (pending 상태)
 */
export async function createAnalysis(id: string): Promise<AnalysisResult> {
  const now = new Date();
  const result: AnalysisResult = {
    id,
    status: "pending",
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + EXPIRY_SECONDS * 1000).toISOString(),
  };

  await redis.setex(KEY_PREFIX + id, EXPIRY_SECONDS, JSON.stringify(result));
  return result;
}

/**
 * 분석 상태 업데이트
 */
export async function updateAnalysisStatus(
  id: string,
  status: AnalysisStatus,
  job?: JobResult,
  error?: string
): Promise<AnalysisResult | null> {
  const key = KEY_PREFIX + id;
  const data = await redis.get(key);

  if (!data) return null;

  const result: AnalysisResult = JSON.parse(data);
  result.status = status;
  if (job) result.job = job;
  if (error) result.error = error;

  // 기존 TTL 유지
  const ttl = await redis.ttl(key);
  if (ttl > 0) {
    await redis.setex(key, ttl, JSON.stringify(result));
  } else {
    await redis.setex(key, EXPIRY_SECONDS, JSON.stringify(result));
  }

  return result;
}

/**
 * 결과 조회
 */
export async function getAnalysis(id: string): Promise<AnalysisResult | null> {
  const data = await redis.get(KEY_PREFIX + id);

  if (!data) return null;

  const result: AnalysisResult = JSON.parse(data);

  // 만료 체크 (Redis TTL이 처리하지만 추가 검증)
  if (new Date(result.expiresAt) < new Date()) {
    await redis.del(KEY_PREFIX + id);
    return null;
  }

  return result;
}

/**
 * 만료된 결과 정리
 * Redis TTL이 자동으로 처리하므로 실제로는 불필요
 * 인터페이스 호환성을 위해 유지
 */
export async function cleanupExpired(): Promise<number> {
  // Redis TTL이 자동으로 만료 처리
  return 0;
}

/**
 * 프롬프트 로그 저장 (디버깅 및 개선용)
 * 
 * @param log - 프롬프트 로그 데이터
 */
export async function savePromptLog(log: PromptLog): Promise<void> {
  try {
    const key = PROMPT_LOG_PREFIX + log.id;
    await redis.setex(key, EXPIRY_SECONDS, JSON.stringify(log));
    console.log(`[Prompt Log] Saved: ${log.type} for analysis ${log.analysisId}`);
  } catch (error) {
    console.error("Failed to save prompt log:", error);
    // 프롬프트 로그 저장 실패는 분석 결과에 영향 주지 않음
  }
}

/**
 * 프롬프트 로그 조회
 * 
 * @param id - 분석 ID
 * @param logType - 로그 타입 (선택적, 특정 타입만 조회)
 * @returns 프롬프트 로그 배열 (여러 타입의 로그가 있을 수 있음)
 * 
 * 주의: keys()는 프로덕션에서 성능 문제를 일으킬 수 있으므로,
 * 가능하면 특정 키를 직접 조회하는 것을 권장합니다.
 */
export async function getPromptLogs(
  id: string,
  logType?: "palm_analysis" | "palm_validation" | "dalle_generation"
): Promise<PromptLog[]> {
  try {
    if (logType) {
      // 특정 타입의 로그만 조회 (더 효율적)
      const key = `${PROMPT_LOG_PREFIX}${id}:${logType}:*`;
      const keys = await redis.keys(key);
      
      if (keys.length === 0) return [];
      
      const logs = await redis.mget(...keys);
      return logs
        .filter((log): log is string => log !== null)
        .map((log) => JSON.parse(log) as PromptLog);
    } else {
      // 모든 타입의 로그 조회
      const pattern = `${PROMPT_LOG_PREFIX}${id}*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length === 0) return [];
      
      const logs = await redis.mget(...keys);
      return logs
        .filter((log): log is string => log !== null)
        .map((log) => JSON.parse(log) as PromptLog);
    }
  } catch (error) {
    console.error("Failed to get prompt logs:", error);
    return [];
  }
}

/**
 * 이미지 저장 (Base64)
 * 
 * Redis는 최대 512MB까지 저장 가능하지만, Base64 이미지는 크기가 큼
 * 환경 변수 ENABLE_IMAGE_STORAGE=true로 활성화
 * 
 * @param id - 분석 ID
 * @param imageType - 이미지 타입
 * @param imageBase64 - Base64 인코딩된 이미지
 */
export async function saveImage(
  id: string,
  imageType: "left" | "right" | "card",
  imageBase64: string
): Promise<void> {
  // 환경 변수로 제어
  if (process.env.ENABLE_IMAGE_STORAGE !== "true") {
    return; // 이미지 저장 비활성화
  }

  try {
    // Base64 크기 체크 (10MB 제한)
    const sizeInBytes = (imageBase64.length * 3) / 4;
    if (sizeInBytes > 10 * 1024 * 1024) {
      console.warn(`[Image Storage] Image too large (${Math.round(sizeInBytes / 1024)}KB), skipping: ${imageType}`);
      return;
    }

    const key = `${IMAGE_PREFIX}${id}:${imageType}`;
    await redis.setex(key, EXPIRY_SECONDS, imageBase64);
    console.log(`[Image Storage] Saved: ${imageType} for analysis ${id} (${Math.round(sizeInBytes / 1024)}KB)`);
  } catch (error) {
    console.error("Failed to save image:", error);
    // 이미지 저장 실패는 분석 결과에 영향 주지 않음
  }
}

/**
 * 이미지 조회
 * 
 * @param id - 분석 ID
 * @param imageType - 이미지 타입
 * @returns Base64 인코딩된 이미지 또는 null
 */
export async function getImage(
  id: string,
  imageType: "left" | "right" | "card"
): Promise<string | null> {
  try {
    const key = `${IMAGE_PREFIX}${id}:${imageType}`;
    const image = await redis.get(key);
    return image;
  } catch (error) {
    console.error("Failed to get image:", error);
    return null;
  }
}

/**
 * Redis 연결 종료 (테스트용)
 */
export async function closeRedis(): Promise<void> {
  await redis.quit();
}

export { redis };

