// Remembers the boards someone has made or opened in this browser, so they can
// find them again from the home page without an account. Nothing here touches
// the database; it's per-browser only.

export interface RecentBoard {
  id: string;
  title: string;
  lastOpenedAt: number;
}

const STORAGE_KEY = "oasis-quiz:recent-boards";
const MAX_BOARDS = 20;
const CHANGE_EVENT = "oasis-quiz:recent-boards-change";
const EMPTY: RecentBoard[] = [];

let cachedRaw: string | null = null;
let cachedBoards: RecentBoard[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getRecentBoards(): RecentBoard[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedBoards;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedBoards = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cachedBoards = EMPTY;
  }
  return cachedBoards;
}

// The list only exists in the browser, so during server rendering it's
// unknown (null) rather than empty; that avoids flashing the empty state.
export function getServerRecentBoards(): RecentBoard[] | null {
  return null;
}

// Accepts a full share/edit link or a bare board id.
export function parseBoardId(input: string): string | null {
  const text = input.trim();
  if (!text) return null;
  const match = text.match(/\/game\/([A-Za-z0-9_-]+)/);
  if (match) return match[1];
  return /^[A-Za-z0-9_-]+$/.test(text) ? text : null;
}

function write(boards: RecentBoard[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage unavailable (private mode, blocked site data); the list just won't persist.
  }
}

export function rememberBoard(id: string, title: string) {
  const others = getRecentBoards().filter((b) => b.id !== id);
  write([{ id, title, lastOpenedAt: Date.now() }, ...others].slice(0, MAX_BOARDS));
}

export function forgetBoard(id: string) {
  write(getRecentBoards().filter((b) => b.id !== id));
}

export function subscribeToRecentBoards(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
