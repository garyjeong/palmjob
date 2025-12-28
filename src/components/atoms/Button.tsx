"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold rounded-2xl
      transition-all duration-[var(--transition-normal)]
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-[var(--color-primary)]
        text-white
        shadow-[var(--shadow-md)]
        hover:shadow-[var(--shadow-lg)] hover:brightness-110
        focus-visible:ring-[var(--color-primary)]
      `,
      secondary: `
        bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-light)]
        text-white
        shadow-[var(--shadow-md)]
        hover:shadow-[var(--shadow-lg)] hover:brightness-110
        focus-visible:ring-[var(--color-secondary)]
      `,
      outline: `
        border-2 border-[var(--color-border-strong)]
        text-[var(--color-primary)]
        bg-[var(--color-surface)]
        hover:bg-[var(--color-primary-50)] hover:border-[var(--color-primary)]
        focus-visible:ring-[var(--color-primary)]
      `,
      ghost: `
        text-[var(--color-text-secondary)]
        hover:bg-[var(--color-primary-50)]
        focus-visible:ring-[var(--color-primary)]
      `,
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
