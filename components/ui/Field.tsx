"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

const baseFieldClasses =
  "w-full rounded-[12px] border-2 bg-white px-3.5 py-2.5 text-ink placeholder:text-ink-faint " +
  "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60";

function borderClasses(hasError?: boolean) {
  return hasError ? "border-danger focus:border-danger" : "border-border focus:border-ink";
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(baseFieldClasses, borderClasses(!!error), className)}
      aria-invalid={!!error}
      {...props}
    />
  )
);
Input.displayName = "Input";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx(baseFieldClasses, "resize-none", borderClasses(!!error), className)}
      aria-invalid={!!error}
      {...props}
    />
  )
);
TextArea.displayName = "TextArea";

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-danger animate-float-in">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
        <circle cx="6" cy="6" r="6" fill="currentColor" opacity="0.15" />
        <path d="M6 3.5v3M6 8.2v.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {children}
    </p>
  );
}
