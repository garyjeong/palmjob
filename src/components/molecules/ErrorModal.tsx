"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms";
import { UploadErrorType, ERROR_MESSAGES } from "@/types";

export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorType: UploadErrorType;
  errorMessage?: string;
  onRetry?: () => void;
}

// 에러 타입별 아이콘 매핑
const ERROR_ICONS: Record<UploadErrorType, string> = {
  NOT_PALM: "📷",
  PALM_CROPPED: "✂️",
  TOO_DARK: "💡",
  TOO_BLURRY: "🔍",
  HAND_MISMATCH: "🤚",
  GENERATION_FAILED: "⚡",
  UNKNOWN: "⚠️",
};

// 에러 타입별 제목 매핑
const ERROR_TITLES: Record<UploadErrorType, string> = {
  NOT_PALM: "손바닥 사진이 아니에요",
  PALM_CROPPED: "손바닥이 잘렸어요",
  TOO_DARK: "사진이 너무 어두워요",
  TOO_BLURRY: "사진이 흐려요",
  HAND_MISMATCH: "손 선택이 맞지 않아요",
  GENERATION_FAILED: "결과 생성에 실패했어요",
  UNKNOWN: "오류가 발생했어요",
};

export function ErrorModal({
  isOpen,
  onClose,
  errorType,
  errorMessage,
  onRetry,
}: ErrorModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const displayMessage = errorMessage || ERROR_MESSAGES[errorType];
  const icon = ERROR_ICONS[errorType];
  const title = ERROR_TITLES[errorType];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-[var(--radius-2xl)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Title */}
        <div className="text-center space-y-3">
          <div className="text-6xl animate-float">{icon}</div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {title}
          </h2>
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {displayMessage}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {onRetry && (
            <Button onClick={onRetry} size="lg" fullWidth>
              다시 시도하기
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
            fullWidth
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

