import type { Category, Game } from "./types";

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
