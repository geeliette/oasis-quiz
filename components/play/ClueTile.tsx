"use client";

import type { Clue } from "@/lib/types";

interface ClueTileProps {
  clue: Clue;
  categoryName: string;
  onSelect: () => void;
}

const TILE_SIZE = "h-[52px] rounded-[10px] sm:h-20 sm:rounded-[16px] lg:h-24";

export function ClueTile({ clue, categoryName, onSelect }: ClueTileProps) {
  const label = `${categoryName || "Category"} for ${clue.value}`;

  if (clue.answered) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Review ${label}`}
        className={`group relative flex items-center justify-center border-2 border-dashed border-line text-line transition-colors hover:border-ink-faint hover:text-ink-faint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/60 ${TILE_SIZE}`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="h-[18px] w-[18px] transition-opacity group-hover:opacity-0 sm:h-6 sm:w-6"
        >
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute text-xs font-bold uppercase tracking-wide opacity-0 transition-opacity group-hover:opacity-100">
          Review
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      className={`flex items-center justify-center border-2 border-ink bg-white font-display text-lg font-extrabold text-ink shadow-[var(--shadow-hard-sm)] transition-transform duration-150 ease-out hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent sm:text-3xl sm:shadow-[var(--shadow-hard)] lg:text-[40px] ${TILE_SIZE}`}
    >
      {clue.value}
    </button>
  );
}
