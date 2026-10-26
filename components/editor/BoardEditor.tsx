"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { Category, Game } from "@/lib/types";
import { blankCategoryFactory, blankClue } from "@/lib/blank";
import { ACTIVE_BOARD_TTL_DAYS } from "@/lib/expiry";
import { rememberBoard } from "@/lib/recentBoards";
import { LIMITS, validateGame, isReadyToPlay } from "@/lib/validation";
import { useAutosaveGame } from "@/hooks/useAutosaveGame";
import { CopyLinkField } from "@/components/ui/CopyLinkField";
import { SaveStatusIndicator } from "@/components/ui/SaveStatus";
import { Button } from "@/components/ui/Button";
import { FieldError, CharCount } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyBoardIcon } from "@/components/ui/Icons";
import { LogoMark } from "@/components/ui/Logo";
import { CATEGORY_COLORS, resolveCategoryColor } from "@/components/play/teamColors";
import { CategoryColumn } from "./CategoryColumn";

function noopSubscribe() {
  return () => {};
}

// Pin every category's colour so it stays put when categories are reordered
// (older boards only have a colour implied by position).
function withColors(categories: Category[]): Category[] {
  return categories.map((c, i) => ({ ...c, color: resolveCategoryColor(c, i) }));
}

function moveById<T extends { id: string }>(items: T[], activeId: string, overId: string): T[] {
  const from = items.findIndex((i) => i.id === activeId);
  const to = items.findIndex((i) => i.id === overId);
  return from < 0 || to < 0 ? items : arrayMove(items, from, to);
}

function nextValue(clues: Category["clues"]): number {
  const max = clues.reduce((m, c) => Math.max(m, c.value), 0);
  return max > 0 ? max + 200 : 200;
}

export function BoardEditor({
  initialGame,
  unsaved = false,
}: {
  initialGame: Game;
  /** True for a new board or demo copy that isn't in the database yet. */
  unsaved?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialGame.title);
  const [categories, setCategories] = useState<Category[]>(() =>
    withColors(initialGame.categories)
  );
  const [navigating, setNavigating] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // The site's origin only exists in the browser; render a relative link on the server.
  const origin = useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => ""
  );

  const errors = useMemo(() => validateGame({ title, categories }), [title, categories]);
  const ready = isReadyToPlay(errors);
  const issueCount = Object.keys(errors).length;
  const visibleErrors = showErrors ? errors : {};

  // The editor doesn't change teams, so it normally leaves them out of saves
  // (the play screen owns scores). A board's first save must carry them,
  // though, or a demo copy would lose the demo's teams.
  const { status, saveNow } = useAutosaveGame(
    initialGame.id,
    unsaved ? { title, categories, teams: initialGame.teams } : { title, categories },
    { enabled: true }
  );

  // Only list the board under "Your boards" once it actually exists in the database.
  useEffect(() => {
    if (status === "saved") rememberBoard(initialGame.id, title);
  }, [status, initialGame.id, title]);

  function updateCategoryName(catId: string, name: string) {
    setCategories((cs) => cs.map((c) => (c.id === catId ? { ...c, name } : c)));
  }
  function updateCategoryColor(catId: string, color: string) {
    setCategories((cs) => cs.map((c) => (c.id === catId ? { ...c, color } : c)));
  }
  function removeCategory(catId: string) {
    setCategories((cs) => cs.filter((c) => c.id !== catId));
  }
  function addCategory() {
    setCategories((cs) => {
      const used = new Set(cs.map((c) => c.color));
      const color =
        CATEGORY_COLORS.find((c) => !used.has(c)) ?? CATEGORY_COLORS[cs.length % CATEGORY_COLORS.length];
      return [...cs, { ...blankCategoryFactory(), color }];
    });
  }
  function moveCategory(activeId: string, overId: string) {
    setCategories((cs) => moveById(cs, activeId, overId));
  }
  function moveClue(catId: string, activeId: string, overId: string) {
    setCategories((cs) =>
      cs.map((c) => (c.id === catId ? { ...c, clues: moveById(c.clues, activeId, overId) } : c))
    );
  }

  // Drag by the grip handle with a mouse, finger or keyboard (Space, then arrows).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleCategoryDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) moveCategory(String(active.id), String(over.id));
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
    // Don't open the play screen until the board is safely on the server; a
    // board that was never saved would show "doesn't exist" there.
    if (await saveNow()) {
      router.push(`/game/${initialGame.id}`);
    } else {
      setNavigating(false);
    }
  }

  const playUrl = origin ? `${origin}/game/${initialGame.id}` : `/game/${initialGame.id}`;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b-2 border-border bg-background/90 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-4 gap-y-3">
          <Link
            href="/"
            aria-label="Oasis Quiz home"
            className="flex h-11 w-11 shrink-0 items-center justify-center"
          >
            <LogoMark size={30} />
          </Link>

          <div className="min-w-[180px] flex-1">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Game"
              aria-label="Board title"
              maxLength={LIMITS.title}
              className="w-full rounded-[10px] bg-transparent px-1 font-display text-2xl font-extrabold tracking-tight text-ink outline-none placeholder:text-ink-faint focus-visible:ring-2 focus-visible:ring-accent sm:text-[28px]"
            />
            <FieldError>{visibleErrors.title}</FieldError>
            <CharCount value={title} max={LIMITS.title} className="text-left" />
          </div>

          {(ready || showErrors) && (
            <p
              className={
                "hidden shrink-0 text-sm font-semibold sm:block " +
                (ready ? "text-success-dark" : "text-danger-dark")
              }
            >
              {ready
                ? "Ready to play"
                : `${issueCount} thing${issueCount === 1 ? "" : "s"} left to fill in`}
            </p>
          )}

          <SaveStatusIndicator status={status} />

          <div className="hidden w-72 lg:block">
            <CopyLinkField url={playUrl} />
          </div>

          <Button onClick={handlePlayClick} disabled={navigating}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 1.8v10.4a.6.6 0 0 0 .9.5l8.4-5.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5Z" fill="currentColor" />
            </svg>
            Play
          </Button>
        </div>

        <div className="mx-auto mt-3 max-w-[1500px] lg:hidden">
          <CopyLinkField url={playUrl} />
        </div>

        <p className="mx-auto mt-2 max-w-[1500px] text-sm text-ink-faint">
          Save the link to come back to this board. Boards are deleted after{" "}
          {ACTIVE_BOARD_TTL_DAYS} days without use.
        </p>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1500px]">
          {categories.length === 0 ? (
            <EmptyState
              icon={<EmptyBoardIcon />}
              title="No categories yet"
              description="A board needs at least one category with a few clues in it."
              action={<Button onClick={addCategory}>+ Add your first category</Button>}
            />
          ) : (
            <div className="flex items-start gap-4 overflow-x-auto pb-6">
              <DndContext
                id="category-order"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleCategoryDragEnd}
              >
                <SortableContext
                  items={categories.map((c) => c.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {categories.map((category, i) => (
                    <CategoryColumn
                      key={category.id}
                      category={category}
                      index={i}
                      errors={visibleErrors}
                      onNameChange={(name) => updateCategoryName(category.id, name)}
                      onColorChange={(color) => updateCategoryColor(category.id, color)}
                      onRemoveCategory={() => removeCategory(category.id)}
                      onAddClue={() => addClue(category.id)}
                      onRemoveClue={(clueId) => removeClue(category.id, clueId)}
                      onMoveClue={(activeId, overId) => moveClue(category.id, activeId, overId)}
                      onClueChange={(clueId, field, value) =>
                        updateClue(category.id, clueId, field, value)
                      }
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <button
                type="button"
                onClick={addCategory}
                className="flex h-40 w-56 shrink-0 flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
                  <path d="M14 5v18M5 14h18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                </svg>
                <span className="font-display text-lg font-extrabold">Add category</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
