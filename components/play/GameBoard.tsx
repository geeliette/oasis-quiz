"use client";

import type { Category } from "@/lib/types";
import { ClueTile } from "./ClueTile";
import { resolveCategoryColor } from "./teamColors";

interface GameBoardProps {
  categories: Category[];
  onSelectClue: (categoryId: string, clueId: string) => void;
}

export function GameBoard({ categories, onSelectClue }: GameBoardProps) {
  const rowCount = Math.max(1, ...categories.map((c) => c.clues.length));

  // A single grid (header row + one row per clue value) keeps every row
  // aligned, even when one category name wraps onto more lines than the rest.
  return (
    <div
      className="grid gap-1.5 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}
    >
      {categories.map((category, i) => (
        <div
          key={category.id}
          className="flex min-h-[46px] items-center justify-center rounded-[10px] border-2 border-ink px-0.5 py-1 text-center sm:min-h-16 sm:rounded-[14px] sm:px-2 sm:py-2"
          style={{ gridColumn: i + 1, gridRow: 1, background: resolveCategoryColor(category, i) }}
        >
          <span className="hyphens-auto break-words text-[0.6rem] font-bold uppercase leading-tight tracking-wide text-ink [overflow-wrap:anywhere] sm:text-sm sm:tracking-wider">
            {category.name || "—"}
          </span>
        </div>
      ))}

      {categories.map((category, i) =>
        Array.from({ length: rowCount }, (_, rowIndex) => {
          const clue = category.clues[rowIndex];
          const position = { gridColumn: i + 1, gridRow: rowIndex + 2 };
          return clue ? (
            <div key={clue.id} style={position} className="flex flex-col">
              <ClueTile
                clue={clue}
                categoryName={category.name}
                onSelect={() => onSelectClue(category.id, clue.id)}
              />
            </div>
          ) : (
            <div key={`${category.id}-${rowIndex}`} style={position} />
          );
        })
      )}
    </div>
  );
}
