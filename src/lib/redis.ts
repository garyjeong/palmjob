/**
 * Redis 저장소
 *
 * 로컬: Docker Redis (ioredis)
 * 프로덕션: Fly.io Redis 또는 Upstash
 * 30일 후 자동 만료 (TTL)
 */

import Redis from "ioredis";
import { AnalysisResult, AnalysisStatus, JobResult } from "@/types";

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
 * Redis 연결 종료 (테스트용)
 */
export async function closeRedis(): Promise<void> {
  await redis.quit();
}

export { redis };

