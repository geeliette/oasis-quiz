"use client";

import type { Category } from "@/lib/types";
import { ClueTile } from "./ClueTile";

const HEADER_ACCENTS = ["#DC2626", "#FB7185", "#2DD4BF", "#38BDF8", "#FBBF24", "#22C55E"];

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
          className="flex min-h-12 items-center justify-center rounded-md px-1 py-1.5 text-center shadow-[0_4px_0_rgba(0,0,0,0.2)] sm:min-h-20 sm:rounded-xl sm:px-2 sm:py-2"
          style={{ gridColumn: i + 1, gridRow: 1, background: HEADER_ACCENTS[i % HEADER_ACCENTS.length] }}
        >
          <span className="hyphens-auto break-words font-display text-[0.6rem] font-extrabold uppercase leading-tight tracking-wide text-white drop-shadow-sm [overflow-wrap:anywhere] sm:text-lg sm:leading-snug">
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
              <ClueTile clue={clue} onSelect={() => onSelectClue(category.id, clue.id)} />
            </div>
          ) : (
            <div key={`${category.id}-${rowIndex}`} style={position} className="aspect-[4/3]" />
          );
        })
      )}
    </div>
  );
}
