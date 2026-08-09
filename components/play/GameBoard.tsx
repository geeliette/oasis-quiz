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

  return (
    <div
      className="grid h-full gap-2 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}
    >
      {categories.map((category, i) => (
        <div key={category.id} className="flex flex-col gap-2 sm:gap-3">
          <div
            className="flex min-h-14 items-center justify-center rounded-xl px-2 py-2 text-center shadow-[0_4px_0_rgba(0,0,0,0.2)] sm:min-h-20"
            style={{ background: HEADER_ACCENTS[i % HEADER_ACCENTS.length] }}
          >
            <span className="font-display text-sm font-extrabold uppercase tracking-wide text-white drop-shadow-sm sm:text-lg">
              {category.name || "—"}
            </span>
          </div>

          {Array.from({ length: rowCount }, (_, rowIndex) => category.clues[rowIndex]).map(
            (clue, rowIndex) =>
              clue ? (
                <ClueTile
                  key={clue.id}
                  clue={clue}
                  onSelect={() => onSelectClue(category.id, clue.id)}
                />
              ) : (
                <div key={rowIndex} className="aspect-[4/3]" />
              )
          )}
        </div>
      ))}
    </div>
  );
}
