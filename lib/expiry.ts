import type { Game } from "./types";

// Boards expire after a stretch without use so abandoned ones clean
// themselves up. Every save or visit pushes the deadline back.
export const ACTIVE_BOARD_TTL_DAYS = 90;
export const EMPTY_BOARD_TTL_DAYS = 7;

const DAY_SECONDS = 24 * 60 * 60;

function hasContent(game: Game): boolean {
  return game.categories.some(
    (c) =>
      c.name.trim() !== "" ||
      c.clues.some((cl) => cl.question.trim() !== "" || cl.answer.trim() !== "")
  );
}

export function ttlSecondsFor(game: Game): number {
  const days = hasContent(game) ? ACTIVE_BOARD_TTL_DAYS : EMPTY_BOARD_TTL_DAYS;
  return days * DAY_SECONDS;
}
