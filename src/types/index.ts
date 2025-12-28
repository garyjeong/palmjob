// 손 선택 타입
export type HandType = "left" | "right";

// 분석 상태 타입
export type AnalysisStatus = "pending" | "analyzing" | "completed" | "failed";

// 분석 요청 타입
export interface AnalyzeRequest {
  hand: HandType;
  image: File;
}

// 분석 결과 타입
export interface AnalysisResult {
  id: string;
  status: AnalysisStatus;
  job?: JobResult;
  error?: string;
  createdAt: string;
  expiresAt: string;
}

// 직업 결과 타입
export interface JobResult {
  title: string;
  cardImageUrl?: string;
  interpretation: string;
  shortComment?: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 에러 타입
export type UploadErrorType =
  | "NOT_PALM" // 손바닥이 아닌 사진
  | "PALM_CROPPED" // 손바닥 잘림
  | "TOO_DARK" // 너무 어두움
  | "TOO_BLURRY" // 너무 흐림
  | "HAND_MISMATCH" // 손 선택 불일치
  | "GENERATION_FAILED" // 생성 실패
  | "UNKNOWN"; // 알 수 없는 오류

// 에러 메시지 매핑
export const ERROR_MESSAGES: Record<UploadErrorType, string> = {
  NOT_PALM: "손바닥 사진을 다시 올려주세요.",
  PALM_CROPPED: "손바닥 전체가 나오게 촬영해 주세요.",
  TOO_DARK: "밝은 곳에서 다시 촬영해 주세요.",
  TOO_BLURRY: "선명하게 다시 촬영해 주세요.",
  HAND_MISMATCH:
    "선택하신 손과 달라 보입니다. 손 선택을 다시 확인하고 재업로드해 주세요.",
  GENERATION_FAILED:
    "일시적으로 결과 생성에 실패했습니다. 다시 업로드해 주세요.",
  UNKNOWN: "오류가 발생했습니다. 다시 시도해 주세요.",
};
