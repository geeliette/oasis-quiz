"use client";

import type { Category } from "@/lib/types";
import { Input, FieldError } from "@/components/ui/Field";
import type { FieldErrors } from "@/lib/validation";
import { ClueEditorCard } from "./ClueEditorCard";

interface CategoryColumnProps {
  category: Category;
  index: number;
  errors: FieldErrors;
  onNameChange: (name: string) => void;
  onRemoveCategory: () => void;
  onAddClue: () => void;
  onRemoveClue: (clueId: string) => void;
  onClueChange: (
    clueId: string,
    field: "value" | "question" | "hint" | "answer",
    value: string
  ) => void;
}

const ACCENTS = ["#DC2626", "#FB7185", "#2DD4BF", "#38BDF8", "#FBBF24", "#22C55E"];

export function CategoryColumn({
  category,
  index,
  errors,
  onNameChange,
  onRemoveCategory,
  onAddClue,
  onRemoveClue,
  onClueChange,
}: CategoryColumnProps) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <div className="flex w-80 shrink-0 flex-col gap-3 rounded-lg border-2 border-border bg-surface-soft/40 p-3">
      <div
        className="rounded-md px-3 py-2.5 text-white shadow-[var(--shadow-soft)]"
        style={{ background: accent }}
      >
        <div className="flex items-center gap-2">
          <Input
            value={category.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={`Category ${index + 1}`}
            className="!border-transparent !bg-white/15 !text-white placeholder:!text-white/70 font-display font-bold focus:!border-white/60"
          />
          <button
            type="button"
            onClick={onRemoveCategory}
            aria-label="Remove category"
            className="shrink-0 rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
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
      </div>
      <FieldError>{errors[`category.${category.id}.name`]}</FieldError>
      <FieldError>{errors[`category.${category.id}.clues`]}</FieldError>

      <div className="flex flex-col gap-3">
        {category.clues.map((clue) => (
          <ClueEditorCard
            key={clue.id}
            clue={clue}
            errors={errors}
            onChange={(field, value) => onClueChange(clue.id, field, value)}
            onRemove={() => onRemoveClue(clue.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddClue}
        className="rounded-md border-2 border-dashed border-border py-2 text-sm font-bold text-ink-soft transition-colors hover:border-primary/40 hover:text-primary"
      >
        + Add clue
      </button>
    </div>
  );
}
