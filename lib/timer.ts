import type { Clue, Game } from "./types";

/** Times the editor offers, in seconds. */
export const TIMER_PRESETS = [10, 15, 20, 30, 45, 60, 90, 120];

/** The presets, plus `value` if it isn't one (e.g. a time set through the API). */
export function timerOptions(value: number | undefined): number[] {
  return value && !TIMER_PRESETS.includes(value)
    ? [...TIMER_PRESETS, value].sort((a, b) => a - b)
    : TIMER_PRESETS;
}

export const TIME_LIMIT_MIN = 5;
export const TIME_LIMIT_MAX = 600;

/** 0 means "no timer"; anything else must be whole seconds within range. */
export function isValidTimeLimit(value: unknown): boolean {
  return (
    value === 0 ||
    (Number.isInteger(value) && (value as number) >= TIME_LIMIT_MIN && (value as number) <= TIME_LIMIT_MAX)
  );
}

/** Seconds a question's timer runs for, or 0 if it has none. */
export function effectiveTimeLimit(clue: Clue, game: Pick<Game, "defaultTimeLimit">): number {
  return clue.timeLimit ?? game.defaultTimeLimit ?? 0;
}

/** "30s", "2 min", for labels. */
export function formatDuration(seconds: number): string {
  return seconds >= 60 && seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds}s`;
}

/** "0:30", for the countdown. */
export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
