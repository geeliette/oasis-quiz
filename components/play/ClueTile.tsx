"use client";

import clsx from "clsx";
import type { Clue } from "@/lib/types";

interface ClueTileProps {
  clue: Clue;
  onSelect: () => void;
}

export function ClueTile({ clue, onSelect }: ClueTileProps) {
  if (clue.answered) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Review clue worth ${clue.value} points`}
        className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-white/5 text-white/20 transition-colors hover:bg-white/10 hover:text-white/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="transition-opacity group-hover:opacity-0"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute font-display text-xs font-bold uppercase tracking-wide opacity-0 transition-opacity group-hover:opacity-100">
          Review
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl",
        "bg-gradient-to-br from-[var(--color-tile-start)] to-[var(--color-tile-end)]",
        "shadow-[0_4px_0_rgba(0,0,0,0.25),0_8px_16px_rgba(0,0,0,0.25)]",
        "transition-all duration-150 ease-out",
        "hover:-translate-y-1 hover:shadow-[0_6px_0_rgba(0,0,0,0.25),0_14px_24px_rgba(0,0,0,0.35)]",
        "active:translate-y-0 active:shadow-[0_2px_0_rgba(0,0,0,0.25),0_4px_8px_rgba(0,0,0,0.3)]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/60"
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-white/10" />
      <span className="relative font-display text-2xl font-extrabold text-accent drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] sm:text-3xl md:text-4xl">
        {clue.value}
      </span>
    </button>
  );
}
