"use client";

import type { Clue } from "@/lib/types";
import { Input, TextArea, FieldError } from "@/components/ui/Field";
import type { FieldErrors } from "@/lib/validation";

interface ClueEditorCardProps {
  clue: Clue;
  errors: FieldErrors;
  onChange: (field: "value" | "question" | "hint" | "answer", value: string) => void;
  onRemove: () => void;
}

export function ClueEditorCard({ clue, errors, onChange, onRemove }: ClueEditorCardProps) {
  return (
    <div className="space-y-2 rounded-md border-2 border-border bg-white p-3 transition-colors focus-within:border-primary/40">
      <div className="flex items-center gap-2">
        <span className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">
          Points
        </span>
        <Input
          type="number"
          value={clue.value === 0 ? "" : clue.value}
          onChange={(e) => onChange("value", e.target.value)}
          error={errors[`clue.${clue.id}.value`]}
          className="!w-24 !py-1 text-sm font-bold"
          min={0}
          step={50}
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove clue"
          className="ml-auto rounded-lg p-1 text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <FieldError>{errors[`clue.${clue.id}.value`]}</FieldError>

      <div>
        <TextArea
          value={clue.question}
          onChange={(e) => onChange("question", e.target.value)}
          placeholder="Question text shown to players…"
          rows={2}
          error={errors[`clue.${clue.id}.question`]}
          className="text-sm"
        />
        <FieldError>{errors[`clue.${clue.id}.question`]}</FieldError>
      </div>

      <div>
        <TextArea
          value={clue.hint ?? ""}
          onChange={(e) => onChange("hint", e.target.value)}
          placeholder="Clue to show before the answer, if no one guesses (optional)…"
          rows={2}
          error={errors[`clue.${clue.id}.hint`]}
          className="text-sm"
        />
        <FieldError>{errors[`clue.${clue.id}.hint`]}</FieldError>
      </div>

      <div>
        <TextArea
          value={clue.answer}
          onChange={(e) => onChange("answer", e.target.value)}
          placeholder="Correct answer…"
          rows={2}
          error={errors[`clue.${clue.id}.answer`]}
          className="text-sm"
        />
        <FieldError>{errors[`clue.${clue.id}.answer`]}</FieldError>
      </div>
    </div>
  );
}
