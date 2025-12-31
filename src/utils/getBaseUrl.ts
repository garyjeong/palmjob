import { headers } from "next/headers";

/**
 * 허용된 도메인 목록
 */
const ALLOWED_DOMAINS = [
  "palm.gary-world.app",
  "gary-world.app",
  "www.gary-world.app",
  "palmjob.fly.dev", // Fly.io 기본 도메인
];

/**
 * 요청 호스트에 따라 base URL을 동적으로 결정합니다.
 * Server Component에서 사용 가능합니다.
 */
export async function getBaseUrl(): Promise<string> {
  // 환경 변수가 설정되어 있으면 우선 사용
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "https";

    if (host) {
      // 허용된 도메인인지 확인
      const isAllowed = ALLOWED_DOMAINS.some(
        (domain) => host === domain || host.endsWith(`.${domain}`)
      );

      if (isAllowed) {
        return `${protocol}://${host}`;
      }
    }
  } catch (error) {
    // headers()가 사용 불가능한 경우 (빌드 타임 등)
    console.warn("Failed to get base URL from headers:", error);
  }

  // 기본값
  return "https://palm.gary-world.app";
}

/**
 * Edge Runtime에서 사용할 수 있는 base URL 가져오기
 * NextRequest에서 직접 호스트를 추출합니다.
 */
export function getBaseUrlFromRequest(request: Request): string {
  // 환경 변수가 설정되어 있으면 우선 사용
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  try {
    const url = new URL(request.url);
    const host = url.host;
    const protocol = url.protocol.replace(":", "");

    if (host) {
      // 허용된 도메인인지 확인
      const isAllowed = ALLOWED_DOMAINS.some(
        (domain) => host === domain || host.endsWith(`.${domain}`)
      );

      if (isAllowed) {
        return `${protocol}://${host}`;
      }
    }
  } catch (error) {
    console.warn("Failed to get base URL from request:", error);
  }

  // 기본값
  return "https://palm.gary-world.app";
}

/**
 * 클라이언트 컴포넌트에서 사용할 수 있는 base URL 가져오기
 */
export function getBaseUrlSync(): string {
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }

  return process.env.NEXT_PUBLIC_BASE_URL || "https://palm.gary-world.app";
}

