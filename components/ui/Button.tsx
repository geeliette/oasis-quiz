"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "accent" | "ghost" | "outline" | "danger" | "success";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark shadow-[0_4px_14px_rgba(124,58,237,0.35)] hover:shadow-[0_6px_18px_rgba(124,58,237,0.45)]",
  accent:
    "bg-accent text-[#3a2600] hover:bg-accent-dark shadow-[0_4px_14px_rgba(251,191,36,0.4)]",
  ghost: "bg-transparent text-ink-soft hover:bg-surface-soft hover:text-ink",
  outline:
    "bg-white text-primary border-2 border-primary/20 hover:border-primary/50 hover:bg-primary-light/10",
  danger: "bg-danger text-white hover:bg-danger-dark shadow-[0_4px_14px_rgba(239,68,68,0.35)]",
  success:
    "bg-success text-white hover:bg-success-dark shadow-[0_4px_14px_rgba(34,197,94,0.35)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-[0.95rem] px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-6 py-3.5 rounded-2xl gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center font-display font-semibold tracking-wide",
          "transition-all duration-150 ease-out active:scale-[0.97]",
          "disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
