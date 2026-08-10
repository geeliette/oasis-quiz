import { newId } from "./id";
import type { Category, Game } from "./types";

const DEFAULT_VALUES = [200, 400, 600, 800, 1000];
const DEFAULT_CATEGORY_COUNT = 5;

function blankCategory(): Category {
  return {
    id: newId(),
    name: "",
    clues: DEFAULT_VALUES.map((value) => ({
      id: newId(),
      value,
      question: "",
      hint: "",
      answer: "",
      revealed: false,
      answered: false,
    })),
  };
}

export function buildBlankGame(id: string): Game {
  const now = Date.now();
  return {
    id,
    title: "",
    categories: Array.from({ length: DEFAULT_CATEGORY_COUNT }, blankCategory),
    teams: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function blankClue(value = 200) {
  return {
    id: newId(),
    value,
    question: "",
    hint: "",
    answer: "",
    revealed: false,
    answered: false,
  };
}

export function blankCategoryFactory(): Category {
  return blankCategory();
}
