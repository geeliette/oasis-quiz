"use client";

import type { Category } from "@/lib/types";
import { FieldError } from "@/components/ui/Field";
import type { FieldErrors } from "@/lib/validation";
import { categoryColor } from "@/components/play/teamColors";
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
  const nameError = errors[`category.${category.id}.name`];
  const color = categoryColor(index);

  return (
    <div
      className="flex w-80 shrink-0 flex-col gap-3 rounded-[20px] p-3"
      // A faded wash of the category's colour behind its white question cards.
      style={{ background: `color-mix(in srgb, ${color} 16%, var(--background))` }}
    >
      <div
        className="flex items-center gap-1 rounded-[14px] border-2 border-ink p-1"
        style={{ background: color }}
      >
        <input
          value={category.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={`Category ${index + 1}`}
          aria-label={`Category ${index + 1} name`}
          aria-invalid={!!nameError}
          className="h-11 min-w-0 flex-1 rounded-[10px] bg-transparent px-2.5 font-display text-lg font-extrabold text-ink outline-none placeholder:text-ink/60 hover:bg-white/30 focus:bg-white focus:ring-2 focus:ring-ink"
        />
        <button
          type="button"
          onClick={onRemoveCategory}
          aria-label={`Remove ${category.name || `category ${index + 1}`}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-ink transition-colors hover:bg-white/40"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <FieldError>{nameError}</FieldError>
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
        className="min-h-11 rounded-[14px] border-2 border-dashed border-field font-bold text-ink-soft transition-colors hover:border-ink hover:bg-white hover:text-ink"
      >
        + Add question
      </button>
    </div>
  );
}
