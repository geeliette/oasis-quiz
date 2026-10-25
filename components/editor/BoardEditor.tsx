"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category, Game } from "@/lib/types";
import { blankCategoryFactory, blankClue } from "@/lib/blank";
import { ACTIVE_BOARD_TTL_DAYS } from "@/lib/expiry";
import { validateGame, isReadyToPlay } from "@/lib/validation";
import { useAutosaveGame } from "@/hooks/useAutosaveGame";
import { CopyLinkField } from "@/components/ui/CopyLinkField";
import { SaveStatusIndicator } from "@/components/ui/SaveStatus";
import { Button } from "@/components/ui/Button";
import { Input, FieldError } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryColumn } from "./CategoryColumn";

function nextValue(clues: Category["clues"]): number {
  const max = clues.reduce((m, c) => Math.max(m, c.value), 0);
  return max > 0 ? max + 200 : 200;
}

export function BoardEditor({ initialGame }: { initialGame: Game }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialGame.title);
  const [categories, setCategories] = useState<Category[]>(initialGame.categories);
  const [origin, setOrigin] = useState("");
  const [navigating, setNavigating] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const errors = useMemo(() => validateGame({ title, categories }), [title, categories]);
  const ready = isReadyToPlay(errors);
  const issueCount = Object.keys(errors).length;
  const visibleErrors = showErrors ? errors : {};

  const { status, saveNow } = useAutosaveGame(
    initialGame.id,
    { title, categories },
    { enabled: true }
  );

  function updateCategoryName(catId: string, name: string) {
    setCategories((cs) => cs.map((c) => (c.id === catId ? { ...c, name } : c)));
  }
  function removeCategory(catId: string) {
    setCategories((cs) => cs.filter((c) => c.id !== catId));
  }
  function addCategory() {
    setCategories((cs) => [...cs, blankCategoryFactory()]);
  }
  function addClue(catId: string) {
    setCategories((cs) =>
      cs.map((c) =>
        c.id === catId ? { ...c, clues: [...c.clues, blankClue(nextValue(c.clues))] } : c
      )
    );
  }
  function removeClue(catId: string, clueId: string) {
    setCategories((cs) =>
      cs.map((c) =>
        c.id === catId ? { ...c, clues: c.clues.filter((cl) => cl.id !== clueId) } : c
      )
    );
  }
  function updateClue(
    catId: string,
    clueId: string,
    field: "value" | "question" | "hint" | "answer",
    value: string
  ) {
    setCategories((cs) =>
      cs.map((c) =>
        c.id !== catId
          ? c
          : {
              ...c,
              clues: c.clues.map((cl) =>
                cl.id !== clueId
                  ? cl
                  : { ...cl, [field]: field === "value" ? Number(value) || 0 : value }
              ),
            }
      )
    );
  }

  async function handlePlayClick() {
    if (!ready) {
      setShowErrors(true);
      return;
    }
    setNavigating(true);
    await saveNow();
    router.push(`/game/${initialGame.id}`);
  }

  const playUrl = origin ? `${origin}/game/${initialGame.id}` : `/game/${initialGame.id}`;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-4 gap-y-3">
          <Link href="/" className="shrink-0 text-2xl" aria-label="Oasis Quiz home">
            🏝️
          </Link>

          <div className="min-w-[180px] flex-1">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Game"
              className="w-full bg-transparent font-display text-xl font-extrabold text-ink outline-none placeholder:text-ink-faint sm:text-2xl"
            />
            <FieldError>{visibleErrors.title}</FieldError>
          </div>

          {(ready || showErrors) && (
            <div
              className={
                "hidden shrink-0 rounded-full px-3 py-1 text-xs font-bold sm:block " +
                (ready ? "bg-success/15 text-success-dark" : "bg-accent/20 text-accent-dark")
              }
            >
              {ready
                ? "Ready to play"
                : `${issueCount} thing${issueCount === 1 ? "" : "s"} to finish`}
            </div>
          )}

          <SaveStatusIndicator status={status} />

          <div className="hidden w-72 lg:block">
            <CopyLinkField url={playUrl} />
          </div>

          <Button onClick={handlePlayClick} variant="accent" disabled={navigating}>
            ▶ Play
          </Button>
        </div>

        <div className="mx-auto mt-3 max-w-[1500px] lg:hidden">
          <CopyLinkField url={playUrl} />
        </div>

        <p className="mx-auto mt-2 max-w-[1500px] text-xs text-ink-faint">
          Save the link to come back to this board. Boards are deleted after{" "}
          {ACTIVE_BOARD_TTL_DAYS} days without use.
        </p>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1500px]">
          {categories.length === 0 ? (
            <EmptyState
              icon="🗂️"
              title="No categories yet"
              description="A board needs at least one category with a few clues in it."
              action={<Button onClick={addCategory}>+ Add your first category</Button>}
            />
          ) : (
            <div className="flex items-start gap-4 overflow-x-auto pb-6">
              {categories.map((category, i) => (
                <CategoryColumn
                  key={category.id}
                  category={category}
                  index={i}
                  errors={visibleErrors}
                  onNameChange={(name) => updateCategoryName(category.id, name)}
                  onRemoveCategory={() => removeCategory(category.id)}
                  onAddClue={() => addClue(category.id)}
                  onRemoveClue={(clueId) => removeClue(category.id, clueId)}
                  onClueChange={(clueId, field, value) =>
                    updateClue(category.id, clueId, field, value)
                  }
                />
              ))}

              <button
                type="button"
                onClick={addCategory}
                className="flex h-32 w-52 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-ink-soft transition-colors hover:border-primary/40 hover:text-primary"
              >
                <span className="text-2xl">＋</span>
                <span className="font-display text-sm font-bold">Add category</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
