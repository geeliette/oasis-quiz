"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import type { Clue } from "@/lib/types";
import { GripIcon } from "@/components/ui/Icons";
import { TextArea, FieldError, CharCount } from "@/components/ui/Field";
import { LIMITS, type FieldErrors } from "@/lib/validation";

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
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: clue.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={clsx(
        "flex flex-col gap-3 rounded-[16px] border border-border bg-white p-3.5",
        isDragging ? "relative z-10 shadow-[var(--shadow-pop)]" : "shadow-[var(--shadow-soft)]"
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder the ${clue.value}-point question`}
          className="-ml-1.5 flex h-11 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-surface-soft hover:text-ink active:cursor-grabbing"
        >
          <GripIcon />
        </button>
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
        const value = field === "hint" ? (clue.hint ?? "") : clue[field];
        return (
          <div key={field} className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-bold text-ink">
              {label}
              {optional && <span className="font-medium text-ink-faint"> (optional)</span>}
            </label>
            <TextArea
              id={id}
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={placeholder}
              maxLength={LIMITS[field]}
              rows={2}
              error={error}
              className="text-[15px] leading-snug"
            />
            <FieldError>{error}</FieldError>
            <CharCount value={value} max={LIMITS[field]} />
          </div>
        );
      })}
    </div>
  );
}
