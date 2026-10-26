"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import type { Category } from "@/lib/types";
import { FieldError, CharCount } from "@/components/ui/Field";
import { GripIcon } from "@/components/ui/Icons";
import { LIMITS, type FieldErrors } from "@/lib/validation";
import { resolveCategoryColor } from "@/components/play/teamColors";
import { ClueEditorCard } from "./ClueEditorCard";
import { ColorPicker } from "./ColorPicker";

interface CategoryColumnProps {
  category: Category;
  index: number;
  errors: FieldErrors;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onRemoveCategory: () => void;
  onAddClue: () => void;
  onRemoveClue: (clueId: string) => void;
  onMoveClue: (activeId: string, overId: string) => void;
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
  onColorChange,
  onRemoveCategory,
  onAddClue,
  onRemoveClue,
  onMoveClue,
  onClueChange,
}: CategoryColumnProps) {
  const nameError = errors[`category.${category.id}.name`];
  const color = resolveCategoryColor(category, index);
  const label = category.name || `category ${index + 1}`;

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  // Questions get their own drag context, so they only reorder within this category.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  function handleClueDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) onMoveClue(String(active.id), String(over.id));
  }

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex w-80 shrink-0 flex-col gap-3 rounded-[20px] p-3",
        isDragging && "relative z-10 shadow-[var(--shadow-pop)]"
      )}
      style={{
        // A faded wash of the category's colour behind its white question cards.
        background: `color-mix(in srgb, ${color} 16%, var(--background))`,
        transform: CSS.Translate.toString(transform),
        transition,
      }}
    >
      <div
        className="flex items-center gap-0.5 rounded-[14px] border-2 border-ink p-1"
        style={{ background: color }}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${label}`}
          className="flex h-11 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-[10px] text-ink/70 transition-colors hover:bg-white/40 hover:text-ink active:cursor-grabbing"
        >
          <GripIcon />
        </button>
        <input
          value={category.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={`Category ${index + 1}`}
          aria-label={`Category ${index + 1} name`}
          maxLength={LIMITS.categoryName}
          aria-invalid={!!nameError}
          className="h-11 min-w-0 flex-1 rounded-[10px] bg-transparent px-2 font-display text-lg font-extrabold text-ink outline-none placeholder:text-ink/60 hover:bg-white/30 focus:bg-white focus:ring-2 focus:ring-ink"
        />
        <ColorPicker value={color} label={label} onChange={onColorChange} />
        <button
          type="button"
          onClick={onRemoveCategory}
          aria-label={`Remove ${label}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-ink transition-colors hover:bg-white/40"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <FieldError>{nameError}</FieldError>
      <CharCount value={category.name} max={LIMITS.categoryName} />
      <FieldError>{errors[`category.${category.id}.clues`]}</FieldError>

      <DndContext
        id={`question-order-${category.id}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleClueDragEnd}
      >
        <SortableContext items={category.clues.map((c) => c.id)} strategy={verticalListSortingStrategy}>
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
        </SortableContext>
      </DndContext>

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
