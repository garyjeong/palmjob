"use client";

import { useCallback, useState, useRef } from "react";

export interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

export function UploadArea({
  onFileSelect,
  disabled = false,
  accept = "image/*",
  maxSizeMB = 10,
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center gap-4 
          p-8 min-h-[200px]
          border-2 border-dashed rounded-[var(--radius-xl)]
          cursor-pointer
          transition-all duration-[var(--transition-normal)]
          overflow-hidden
          ${
            isDragging
              ? "border-[var(--color-primary)] bg-[var(--color-primary-50)] scale-[1.02]"
              : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-50)]/50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {/* 손금 패턴 배경 */}
        <div className="absolute inset-0 palm-pattern opacity-30" />
        
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        {/* 아이콘 */}
        <div className={`
          relative text-6xl
          transition-transform duration-[var(--transition-normal)]
          ${isDragging ? "scale-110 animate-float" : ""}
        `}>
          📷
        </div>

        {/* 텍스트 */}
        <div className="relative text-center">
          <p className="font-semibold text-[var(--color-text-primary)]">
            손바닥 사진을 업로드하세요
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            클릭하거나 파일을 드래그해서 업로드
          </p>
        </div>
        
        {/* 파일 형식 안내 */}
        <div className="relative flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span className="px-2 py-1 rounded-full bg-[var(--color-primary-50)]">JPG</span>
          <span className="px-2 py-1 rounded-full bg-[var(--color-primary-50)]">PNG</span>
          <span className="px-2 py-1 rounded-full bg-[var(--color-primary-50)]">HEIC</span>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-3 text-sm text-[var(--color-error)] flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}
