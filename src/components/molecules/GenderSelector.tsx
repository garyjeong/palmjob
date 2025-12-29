"use client";

import { Gender } from "@/types";

export interface GenderSelectorProps {
  value: Gender | null;
  onChange: (gender: Gender) => void;
}

export function GenderSelector({ value, onChange }: GenderSelectorProps) {
  return (
    <div className="flex gap-3">
      {/* 남성 버튼 */}
      <button
        type="button"
        onClick={() => onChange("male")}
        className={`
          flex-1 py-4 px-6 rounded-[var(--radius-xl)] font-medium
          flex items-center justify-center gap-2
          transition-all duration-[var(--transition-normal)]
          ${
            value === "male"
              ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-md)]"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-2 border-[var(--color-border)] hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-50)]/50"
          }
        `}
      >
        <span className="text-2xl">👨</span>
        <span>남성</span>
      </button>

      {/* 여성 버튼 */}
      <button
        type="button"
        onClick={() => onChange("female")}
        className={`
          flex-1 py-4 px-6 rounded-[var(--radius-xl)] font-medium
          flex items-center justify-center gap-2
          transition-all duration-[var(--transition-normal)]
          ${
            value === "female"
              ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-md)]"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-2 border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
          }
        `}
      >
        <span className="text-2xl">👩</span>
        <span>여성</span>
      </button>
    </div>
  );
}

