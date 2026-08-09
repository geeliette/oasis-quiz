import { customAlphabet } from "nanoid";

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no 0/1/l/o for readability

const gameId = customAlphabet(ALPHABET, 8);
const shortId = customAlphabet(ALPHABET, 10);

export function newGameId(): string {
  return gameId();
}

export function newId(): string {
  return shortId();
}
