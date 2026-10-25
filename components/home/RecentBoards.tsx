"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { DEMO_GAME_ID } from "@/lib/demo";
import {
  forgetBoard,
  getRecentBoards,
  getServerRecentBoards,
  parseBoardId,
  rememberBoard,
  subscribeToRecentBoards,
} from "@/lib/recentBoards";
import type { Game } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FieldError, Input } from "@/components/ui/Field";

// Gives each board a stable sticker colour so rows are easy to tell apart.
const DOT_COLORS = ["bg-coral", "bg-accent", "bg-teal", "bg-sky", "bg-lilac"];
function dotColor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return DOT_COLORS[hash % DOT_COLORS.length];
}

function timeAgo(timestamp: number): string {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function RecentBoards() {
  const boards = useSyncExternalStore(
    subscribeToRecentBoards,
    getRecentBoards,
    getServerRecentBoards
  );
  const [adding, setAdding] = useState(false);

  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[26px] font-extrabold text-ink">Your boards</h2>
          <p className="text-sm text-ink-faint">Saved in this browser</p>
        </div>
        {!adding && (
          <Button variant="outline" onClick={() => setAdding(true)} className="shrink-0">
            + Add by link
          </Button>
        )}
      </div>

      {adding && <AddBoardForm onDone={() => setAdding(false)} />}

      {/* null = still reading this browser's list; render nothing to avoid a flash. */}
      {boards && boards.length === 0 && !adding && (
        <div className="mt-3.5 rounded-[16px] border-2 border-dashed border-line px-5 py-7 text-center">
          <p className="font-display text-lg font-extrabold text-ink">No boards yet</p>
          <p className="mt-1 text-ink-soft">
            Boards you create or play here will show up in this list. Got a link to one from
            before?{" "}
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="font-bold text-ink underline decoration-coral decoration-2 underline-offset-4 hover:decoration-ink"
            >
              Add it by link
            </button>
            .
          </p>
        </div>
      )}

      {boards && boards.length > 0 && (
        <ul className="mt-3.5 flex flex-col gap-3">
          {boards.map((board) => (
            // The title link stretches over the whole row (after:inset-0) so
            // clicking anywhere opens the board; Edit and remove sit above it.
            <li
              key={board.id}
              className="group relative flex items-center gap-2 rounded-[16px] border-2 border-ink bg-white py-3 pl-5 pr-2 shadow-[var(--shadow-hard)] transition-transform hover:-translate-x-px hover:-translate-y-px"
            >
              <span
                className={`${dotColor(board.id)} h-3 w-3 shrink-0 rounded-full border-2 border-ink`}
                aria-hidden
              />
              <div className="min-w-0 flex-1 pl-1.5">
                <Link
                  href={`/game/${board.id}`}
                  className="block truncate font-display text-[19px] font-extrabold text-ink outline-none after:absolute after:inset-0 after:rounded-[16px] after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-accent focus-visible:after:ring-offset-2"
                >
                  {board.title.trim() || "Untitled game"}
                </Link>
                <p className="text-sm text-ink-faint">Opened {timeAgo(board.lastOpenedAt)}</p>
              </div>
              <Link
                href={`/game/${board.id}/edit`}
                className="relative z-10 inline-flex min-h-11 shrink-0 items-center rounded-[10px] px-3.5 font-bold text-ink transition-colors hover:bg-surface-soft"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => forgetBoard(board.id)}
                aria-label={`Remove ${board.title.trim() || "Untitled game"} from this list`}
                title="Remove from this list"
                className="relative z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-surface-soft hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AddBoardForm({ onDone }: { onDone: () => void }) {
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const id = parseBoardId(link);
    if (!id) {
      setError("That doesn't look like a board link. It should contain /game/ followed by an id.");
      return;
    }
    if (id === DEMO_GAME_ID) {
      setError("That's the demo board. It's always available from the button above.");
      return;
    }

    // Look the board up first so typos and expired links don't end up in the list.
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/${id}`);
      if (res.status === 404) {
        setError("We couldn't find a board at that link. It may have expired or been mistyped.");
        return;
      }
      if (!res.ok) throw new Error();
      const game = (await res.json()) as Game;
      rememberBoard(game.id, game.title);
      onDone();
    } catch {
      setError("Something went wrong checking that link. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3.5 rounded-[16px] border-2 border-ink bg-white p-4 shadow-[var(--shadow-hard)]"
    >
      <label htmlFor="board-link" className="text-sm font-bold text-ink">
        Paste a board link
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input
          id="board-link"
          autoFocus
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setError(null);
          }}
          placeholder="https://oasis-quiz.vercel.app/game/abc123xy"
          error={error ?? undefined}
          className="min-w-0 flex-1 text-sm"
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={checking || !link.trim()} className="flex-1 sm:flex-none">
            {checking ? "Checking…" : "Add board"}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </div>
      <FieldError>{error ?? undefined}</FieldError>
    </form>
  );
}
