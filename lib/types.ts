export interface Clue {
  id: string;
  value: number;
  question: string;
  hint?: string;
  answer: string;
  revealed: boolean;
  answered: boolean;
}

export interface Category {
  id: string;
  name: string;
  /** Sticker colour; boards saved before this existed fall back to one by position. */
  color?: string;
  clues: Clue[];
}

export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

export interface Game {
  id: string;
  title: string;
  categories: Category[];
  teams: Team[];
  createdAt: number;
  updatedAt: number;
}

export type GameUpdate = Partial<Pick<Game, "title" | "categories" | "teams">>;
