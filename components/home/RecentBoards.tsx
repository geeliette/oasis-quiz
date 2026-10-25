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
    <section className="mt-14 w-full max-w-2xl text-left">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Your boards</h2>
          <p className="text-xs text-ink-faint">Saved in this browser</p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="shrink-0 rounded-lg px-3 py-1.5 font-display text-sm font-bold text-primary transition-colors hover:bg-surface-soft"
          >
            + Add by link
          </button>
        )}
      </div>

      {adding && <AddBoardForm onDone={() => setAdding(false)} />}

      {/* null = still reading this browser's list; render nothing to avoid a flash. */}
      {boards && boards.length === 0 && !adding && (
        <div className="mt-3 rounded-xl border-2 border-dashed border-border px-4 py-6 text-center">
          <p className="font-display font-bold text-ink">No boards yet</p>
          <p className="mt-1 text-sm text-ink-soft">
            Boards you create or play here will show up in this list. Got a link to one from
            before?{" "}
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="font-bold text-primary underline-offset-2 hover:underline"
            >
              Add it by link
            </button>
            .
          </p>
        </div>
      )}

      {boards && boards.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {boards.map((board) => (
            // The title link stretches over the whole row (after:inset-0) so
            // clicking anywhere opens the board; Edit and remove sit above it.
            <li
              key={board.id}
              className="group relative flex items-center gap-2 rounded-xl border-2 border-border bg-white py-3 pl-4 pr-2 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] focus-within:border-primary/40 sm:gap-3"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/game/${board.id}`}
                  className="block truncate font-display font-bold text-ink outline-none transition-colors group-hover:text-primary after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-primary/50"
                >
                  {board.title.trim() || "Untitled game"}
                </Link>
                <p className="text-xs text-ink-faint">Opened {timeAgo(board.lastOpenedAt)}</p>
              </div>
              <Link
                href={`/game/${board.id}/edit`}
                className="relative z-10 shrink-0 rounded-lg px-3 py-1.5 font-display text-sm font-bold text-ink-soft transition-colors hover:bg-surface-soft hover:text-primary"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => forgetBoard(board.id)}
                aria-label={`Remove ${board.title.trim() || "Untitled game"} from this list`}
                title="Remove from this list"
                className="relative z-10 shrink-0 rounded-lg p-2 text-ink-faint transition-colors hover:bg-surface-soft hover:text-ink"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
      className="mt-3 rounded-xl border-2 border-border bg-white p-3 shadow-[var(--shadow-soft)]"
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
          <Button type="submit" size="sm" disabled={checking || !link.trim()} className="flex-1 sm:flex-none">
            {checking ? "Checking…" : "Add board"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </div>
      <FieldError>{error ?? undefined}</FieldError>
    </form>
  );
}
