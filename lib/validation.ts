import type { Category, Game, GameUpdate } from "./types";

/** Character limits for board text, shared by the editor and the save API. */
export const LIMITS = {
  title: 50,
  categoryName: 40,
  question: 300,
  hint: 200,
  answer: 150,
} as const;

/** Largest save request the API accepts, comfortably above any real board. */
export const MAX_BODY_BYTES = 200_000;

export type FieldErrors = Record<string, string>;

export function validateGame(
  game: Pick<Game, "title" | "categories">
): FieldErrors {
  const errors: FieldErrors = {};

  if (!game.title.trim()) {
    errors["title"] = "Give your game a title.";
  }

  if (game.categories.length === 0) {
    errors["categories"] = "Add at least one category to get started.";
  }

  game.categories.forEach((cat: Category) => {
    if (!cat.name.trim()) {
      errors[`category.${cat.id}.name`] = "Category needs a name.";
    }
    if (cat.clues.length === 0) {
      errors[`category.${cat.id}.clues`] = "Add at least one clue.";
    }
    cat.clues.forEach((clue) => {
      if (!clue.question.trim()) {
        errors[`clue.${clue.id}.question`] = "Question can't be empty.";
      }
      if (!clue.answer.trim()) {
        errors[`clue.${clue.id}.answer`] = "Answer can't be empty.";
      }
      if (!clue.value || clue.value <= 0) {
        errors[`clue.${clue.id}.value`] = "Enter a point value above 0.";
      }
    });
  });

  return errors;
}

export function isReadyToPlay(errors: FieldErrors): boolean {
  return Object.keys(errors).length === 0;
}

/**
 * Lists the text fields in a save that are over their limit. Boards saved
 * before the limits existed may already be over, so a field is only flagged
 * if it is longer than what's stored for it, letting people trim it over
 * several saves instead of every save being rejected.
 */
export function findTooLongFields(update: GameUpdate, existing: Game | null): string[] {
  const stored = new Map<string, number>();
  if (existing) {
    stored.set("title", existing.title.length);
    for (const cat of existing.categories) {
      stored.set(`category.${cat.id}.name`, cat.name.length);
      for (const clue of cat.clues) {
        stored.set(`clue.${clue.id}.question`, clue.question.length);
        stored.set(`clue.${clue.id}.hint`, clue.hint?.length ?? 0);
        stored.set(`clue.${clue.id}.answer`, clue.answer.length);
      }
    }
  }

  const tooLong: string[] = [];
  function check(key: string, value: unknown, limit: number) {
    if (typeof value !== "string" || value.length <= limit) return;
    if (value.length > (stored.get(key) ?? 0)) tooLong.push(key);
  }

  check("title", update.title, LIMITS.title);
  for (const cat of update.categories ?? []) {
    check(`category.${cat.id}.name`, cat.name, LIMITS.categoryName);
    for (const clue of cat.clues ?? []) {
      check(`clue.${clue.id}.question`, clue.question, LIMITS.question);
      check(`clue.${clue.id}.hint`, clue.hint, LIMITS.hint);
      check(`clue.${clue.id}.answer`, clue.answer, LIMITS.answer);
    }
  }
  return tooLong;
}
