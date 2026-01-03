import { Gender, UploadErrorType } from "@/types";

// localStorage 키
const STORAGE_KEY_UPLOAD_DATA = "palmjob:upload_data";
const STORAGE_KEY_ERROR_INFO = "palmjob:error_info";

// 저장된 업로드 데이터 타입
export interface StoredUploadData {
  gender: Gender;
  leftImageUrl: string; // Object URL
  rightImageUrl: string; // Object URL
  timestamp: number;
}

// 에러 정보 타입
export interface ErrorInfo {
  errorType: UploadErrorType;
  errorMessage: string;
  timestamp: number;
}

/**
 * 업로드 데이터 저장 (Object URL 사용)
 */
export function saveUploadData(
  gender: Gender,
  leftImage: File | null,
  rightImage: File | null
): void {
  if (!leftImage || !rightImage) {
    console.warn("Cannot save upload data: images are missing");
    return;
  }

  try {
    // 기존 Object URL 정리
    const existing = restoreUploadData();
    if (existing) {
      URL.revokeObjectURL(existing.leftImageUrl);
      URL.revokeObjectURL(existing.rightImageUrl);
    }

    // 새로운 Object URL 생성
    const leftImageUrl = URL.createObjectURL(leftImage);
    const rightImageUrl = URL.createObjectURL(rightImage);

    const data: StoredUploadData = {
      gender,
      leftImageUrl,
      rightImageUrl,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY_UPLOAD_DATA, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save upload data:", error);
  }
}

/**
 * 저장된 업로드 데이터 복원
 */
export function restoreUploadData(): StoredUploadData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_UPLOAD_DATA);
    if (!stored) return null;

    const data: StoredUploadData = JSON.parse(stored);

    // 1시간 이상 지난 데이터는 삭제
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - data.timestamp > oneHour) {
      clearUploadData();
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to restore upload data:", error);
    return null;
  }
}

/**
 * Object URL에서 File 객체 복원
 */
export async function restoreFilesFromUrls(
  leftImageUrl: string,
  rightImageUrl: string
): Promise<{ leftFile: File; rightFile: File } | null> {
  try {
    const [leftResponse, rightResponse] = await Promise.all([
      fetch(leftImageUrl),
      fetch(rightImageUrl),
    ]);

    if (!leftResponse.ok || !rightResponse.ok) {
      console.error("Failed to fetch images from Object URLs");
      return null;
    }

    const [leftBlob, rightBlob] = await Promise.all([
      leftResponse.blob(),
      rightResponse.blob(),
    ]);

    // Blob에서 File 객체 생성
    const leftFile = new File([leftBlob], "left-hand.jpg", {
      type: leftBlob.type || "image/jpeg",
    });
    const rightFile = new File([rightBlob], "right-hand.jpg", {
      type: rightBlob.type || "image/jpeg",
    });

    return { leftFile, rightFile };
  } catch (error) {
    console.error("Failed to restore files from URLs:", error);
    return null;
  }
}

/**
 * 업로드 데이터 삭제
 */
export function clearUploadData(): void {
  try {
    const existing = restoreUploadData();
    if (existing) {
      // Object URL 정리
      URL.revokeObjectURL(existing.leftImageUrl);
      URL.revokeObjectURL(existing.rightImageUrl);
    }

    localStorage.removeItem(STORAGE_KEY_UPLOAD_DATA);
  } catch (error) {
    console.error("Failed to clear upload data:", error);
  }
}

/**
 * 에러 정보 저장
 */
export function saveErrorInfo(
  errorType: UploadErrorType,
  errorMessage: string
): void {
  try {
    const errorInfo: ErrorInfo = {
      errorType,
      errorMessage,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY_ERROR_INFO, JSON.stringify(errorInfo));
  } catch (error) {
    console.error("Failed to save error info:", error);
  }
}

/**
 * 에러 정보 조회 및 삭제 (한 번만 읽을 수 있도록)
 */
export function getErrorInfo(): ErrorInfo | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ERROR_INFO);
    if (!stored) return null;

    const errorInfo: ErrorInfo = JSON.parse(stored);

    // 조회 후 즉시 삭제 (중복 표시 방지)
    localStorage.removeItem(STORAGE_KEY_ERROR_INFO);

    // 1시간 이상 지난 에러 정보는 무시
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - errorInfo.timestamp > oneHour) {
      return null;
    }

    return errorInfo;
  } catch (error) {
    console.error("Failed to get error info:", error);
    return null;
  }
}

