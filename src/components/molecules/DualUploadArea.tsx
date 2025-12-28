"use client";

import { useCallback, useState, useRef } from "react";

export interface DualUploadAreaProps {
  leftImage: File | null;
  rightImage: File | null;
  onLeftImageSelect: (file: File | null) => void;
  onRightImageSelect: (file: File | null) => void;
  maxSizeMB?: number;
}

export function DualUploadArea({
  leftImage,
  rightImage,
  onLeftImageSelect,
  onRightImageSelect,
  maxSizeMB = 10,
}: DualUploadAreaProps) {
  const [leftPreview, setLeftPreview] = useState<string | null>(null);
  const [rightPreview, setRightPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 업로드 가능합니다.");
        return false;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`);
        return false;
      }

      return true;
    },
    [maxSizeMB]
  );

  const handleLeftFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onLeftImageSelect(file);
        const url = URL.createObjectURL(file);
        setLeftPreview(url);
      }
    },
    [validateFile, onLeftImageSelect]
  );

  const handleRightFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onRightImageSelect(file);
        const url = URL.createObjectURL(file);
        setRightPreview(url);
      }
    },
    [validateFile, onRightImageSelect]
  );

  const clearLeftImage = useCallback(() => {
    if (leftPreview) URL.revokeObjectURL(leftPreview);
    setLeftPreview(null);
    onLeftImageSelect(null);
    if (leftInputRef.current) leftInputRef.current.value = "";
  }, [leftPreview, onLeftImageSelect]);

  const clearRightImage = useCallback(() => {
    if (rightPreview) URL.revokeObjectURL(rightPreview);
    setRightPreview(null);
    onRightImageSelect(null);
    if (rightInputRef.current) rightInputRef.current.value = "";
  }, [rightPreview, onRightImageSelect]);

  const handleLeftChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleLeftFile(file);
    },
    [handleLeftFile]
  );

  const handleRightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleRightFile(file);
    },
    [handleRightFile]
  );

  return (
    <div className="space-y-4">
      {/* 양손 업로드 영역 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 왼손 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
            왼손
            {leftImage && (
              <span className="ml-auto text-[var(--color-success)]">✓</span>
            )}
          </label>

          {leftPreview ? (
            <div className="relative group aspect-square">
              <img
                src={leftPreview}
                alt="왼손 사진"
                className="w-full h-full object-cover rounded-[var(--radius-xl)] border-2 border-[var(--color-primary)]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[var(--radius-xl)] flex items-center justify-center">
                <button
                  type="button"
                  onClick={clearLeftImage}
                  className="px-3 py-1.5 bg-white/90 rounded-full text-sm font-medium text-[var(--color-text-primary)] hover:bg-white transition-colors"
                >
                  다시 선택
                </button>
              </div>
              <button
                type="button"
                onClick={clearLeftImage}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                aria-label="왼손 사진 삭제"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => leftInputRef.current?.click()}
              className="
                w-full aspect-square flex flex-col items-center justify-center gap-2
                border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-xl)]
                bg-[var(--color-surface)] hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-50)]/50
                transition-all duration-[var(--transition-normal)]
              "
            >
              <span className="text-4xl">🤚</span>
              <span className="text-sm text-[var(--color-text-muted)]">왼손 업로드</span>
            </button>
          )}
          <input
            ref={leftInputRef}
            type="file"
            accept="image/*"
            onChange={handleLeftChange}
            className="hidden"
          />
        </div>

        {/* 오른손 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]">
            오른손
            {rightImage && (
              <span className="ml-auto text-[var(--color-success)]">✓</span>
            )}
          </label>

          {rightPreview ? (
            <div className="relative group aspect-square">
              <img
                src={rightPreview}
                alt="오른손 사진"
                className="w-full h-full object-cover rounded-[var(--radius-xl)] border-2 border-[var(--color-primary)]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[var(--radius-xl)] flex items-center justify-center">
                <button
                  type="button"
                  onClick={clearRightImage}
                  className="px-3 py-1.5 bg-white/90 rounded-full text-sm font-medium text-[var(--color-text-primary)] hover:bg-white transition-colors"
                >
                  다시 선택
                </button>
              </div>
              <button
                type="button"
                onClick={clearRightImage}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                aria-label="오른손 사진 삭제"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => rightInputRef.current?.click()}
              className="
                w-full aspect-square flex flex-col items-center justify-center gap-2
                border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-xl)]
                bg-[var(--color-surface)] hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-50)]/50
                transition-all duration-[var(--transition-normal)]
              "
            >
              <span className="text-4xl transform scale-x-[-1]">🤚</span>
              <span className="text-sm text-[var(--color-text-muted)]">오른손 업로드</span>
            </button>
          )}
          <input
            ref={rightInputRef}
            type="file"
            accept="image/*"
            onChange={handleRightChange}
            className="hidden"
          />
        </div>
      </div>

      {/* 상태 표시 */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {leftImage && rightImage ? (
          <span className="text-[var(--color-success)] font-medium">
            ✨ 양손 모두 준비되었어요!
          </span>
        ) : (
          <span className="text-[var(--color-text-muted)]">
            {!leftImage && !rightImage
              ? "양손 사진을 모두 업로드해 주세요"
              : !leftImage
              ? "왼손 사진을 업로드해 주세요"
              : "오른손 사진을 업로드해 주세요"}
          </span>
        )}
      </div>

      {/* 파일 형식 안내 */}
      <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
        <span className="px-2 py-1 rounded-full bg-[var(--color-primary-50)]">JPG</span>
        <span className="px-2 py-1 rounded-full bg-[var(--color-primary-50)]">PNG</span>
        <span className="px-2 py-1 rounded-full bg-[var(--color-primary-50)]">HEIC</span>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="text-sm text-[var(--color-error)] text-center flex items-center justify-center gap-2">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}
