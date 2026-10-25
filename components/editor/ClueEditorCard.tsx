"use client";

import type { Clue } from "@/lib/types";
import { TextArea, FieldError } from "@/components/ui/Field";
import type { FieldErrors } from "@/lib/validation";

interface ClueEditorCardProps {
  clue: Clue;
  errors: FieldErrors;
  onChange: (field: "value" | "question" | "hint" | "answer", value: string) => void;
  onRemove: () => void;
}

const FIELDS = [
  { field: "question", label: "Question", optional: false, placeholder: "What players see first…" },
  { field: "hint", label: "Clue", optional: true, placeholder: "A nudge if nobody gets it…" },
  { field: "answer", label: "Answer", optional: false, placeholder: "The correct answer…" },
] as const;

export function ClueEditorCard({ clue, errors, onChange, onRemove }: ClueEditorCardProps) {
  const valueError = errors[`clue.${clue.id}.value`];

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-border bg-white p-3.5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2">
          <span className="sr-only">Points</span>
          <input
            type="number"
            value={clue.value === 0 ? "" : clue.value}
            onChange={(e) => onChange("value", e.target.value)}
            aria-invalid={!!valueError}
            min={0}
            step={50}
            className={`h-11 w-24 rounded-[12px] border-2 bg-white px-3 text-center font-display text-lg font-extrabold text-ink outline-none focus:border-ink focus:ring-2 focus:ring-accent ${valueError ? "border-danger" : "border-field"}`}
          />
          <span className="text-sm font-bold text-ink-soft">points</span>
        </label>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove question"
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <FieldError>{valueError}</FieldError>

      {FIELDS.map(({ field, label, optional, placeholder }) => {
        const id = `${clue.id}-${field}`;
        const error = errors[`clue.${clue.id}.${field}`];
        return (
          <div key={field} className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-bold text-ink">
              {label}
              {optional && <span className="font-medium text-ink-faint"> (optional)</span>}
            </label>
            <TextArea
              id={id}
              value={field === "hint" ? (clue.hint ?? "") : clue[field]}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={placeholder}
              rows={2}
              error={error}
              className="text-[15px] leading-snug"
            />
            <FieldError>{error}</FieldError>
          </div>
        );
      })}
    </div>
  );
}
