"use client";

import { HandType } from "@/types";

export interface HandSelectorProps {
  selected: HandType | null;
  onSelect: (hand: HandType) => void;
}

export function HandSelector({ selected, onSelect }: HandSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onSelect("left")}
        className={`
          relative flex flex-col items-center gap-3 p-6 
          rounded-[var(--radius-xl)] border-2 
          transition-all duration-[var(--transition-normal)]
          group overflow-hidden
          ${
            selected === "left"
              ? "border-[var(--color-primary)] bg-[var(--color-primary-50)] shadow-[var(--shadow-md)]"
              : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary-light)] hover:shadow-[var(--shadow-sm)]"
          }
        `}
      >
        {/* 배경 글로우 효과 */}
        {selected === "left" && (
          <div className="absolute inset-0 bg-[var(--gradient-glow)] opacity-50" />
        )}
        
        <span className="relative text-5xl transition-transform duration-[var(--transition-normal)] group-hover:scale-110">
          🤚
        </span>
        <span
          className={`
            relative font-semibold text-lg
            ${
              selected === "left"
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)]"
            }
          `}
        >
          왼손
        </span>
        
        {/* 선택 체크 표시 */}
        {selected === "left" && (
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={() => onSelect("right")}
        className={`
          relative flex flex-col items-center gap-3 p-6 
          rounded-[var(--radius-xl)] border-2 
          transition-all duration-[var(--transition-normal)]
          group overflow-hidden
          ${
            selected === "right"
              ? "border-[var(--color-primary)] bg-[var(--color-primary-50)] shadow-[var(--shadow-md)]"
              : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary-light)] hover:shadow-[var(--shadow-sm)]"
          }
        `}
      >
        {/* 배경 글로우 효과 */}
        {selected === "right" && (
          <div className="absolute inset-0 bg-[var(--gradient-glow)] opacity-50" />
        )}
        
        <span className="relative text-5xl transform scale-x-[-1] transition-transform duration-[var(--transition-normal)] group-hover:scale-110 group-hover:scale-x-[-1.1]">
          🤚
        </span>
        <span
          className={`
            relative font-semibold text-lg
            ${
              selected === "right"
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)]"
            }
          `}
        >
          오른손
        </span>
        
        {/* 선택 체크 표시 */}
        {selected === "right" && (
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
}
