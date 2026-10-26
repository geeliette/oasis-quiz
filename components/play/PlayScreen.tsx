"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Category, Game, Team } from "@/lib/types";
import { newId } from "@/lib/id";
import { nextTeamColor, resolveCategoryColor } from "./teamColors";
import { useAutosaveGame } from "@/hooks/useAutosaveGame";
import { SaveStatusIndicator } from "@/components/ui/SaveStatus";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";
import { GameBoard } from "./GameBoard";
import { ClueModal } from "./ClueModal";
import { Scoreboard, AddTeamPrompt } from "./Scoreboard";
import { DEMO_GAME_ID } from "@/lib/demo";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { rememberBoard } from "@/lib/recentBoards";
import { effectiveTimeLimit } from "@/lib/timer";

export function PlayScreen({ initialGame }: { initialGame: Game }) {
  const [categories, setCategories] = useState<Category[]>(initialGame.categories);
  const [teams, setTeams] = useState<Team[]>(initialGame.teams);
  const [activeClueId, setActiveClueId] = useState<{ categoryId: string; clueId: string } | null>(
    null
  );
  const [confirmingRestart, setConfirmingRestart] = useState(false);

  const totalClues = useMemo(
    () => categories.reduce((sum, c) => sum + c.clues.length, 0),
    [categories]
  );
  const answeredClues = useMemo(
    () => categories.reduce((sum, c) => sum + c.clues.filter((cl) => cl.answered).length, 0),
    [categories]
  );
  const boardComplete = totalClues > 0 && answeredClues === totalClues;

  const { status } = useAutosaveGame(
    initialGame.id,
    { categories, teams },
    { enabled: true, delay: 500 }
  );

  useEffect(() => {
    if (initialGame.id !== DEMO_GAME_ID) rememberBoard(initialGame.id, initialGame.title);
  }, [initialGame.id, initialGame.title]);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeClueId?.categoryId) ?? null,
    [categories, activeClueId]
  );
  const activeClue = useMemo(
    () => activeCategory?.clues.find((c) => c.id === activeClueId?.clueId) ?? null,
    [activeCategory, activeClueId]
  );

  function handleSelectClue(categoryId: string, clueId: string) {
    setCategories((cs) =>
      cs.map((c) =>
        c.id !== categoryId
          ? c
          : { ...c, clues: c.clues.map((cl) => (cl.id === clueId ? { ...cl, revealed: true } : cl)) }
      )
    );
    setActiveClueId({ categoryId, clueId });
  }

  function handleCloseClue() {
    if (activeClueId) {
      const { categoryId, clueId } = activeClueId;
      setCategories((cs) =>
        cs.map((c) =>
          c.id !== categoryId
            ? c
            : {
                ...c,
                clues: c.clues.map((cl) => (cl.id === clueId ? { ...cl, answered: true } : cl)),
              }
        )
      );
    }
    setActiveClueId(null);
  }

  function handleCancelClue() {
    setActiveClueId(null);
  }

  function handleResetClue() {
    if (!activeClueId) return;
    const { categoryId, clueId } = activeClueId;
    setCategories((cs) =>
      cs.map((c) =>
        c.id !== categoryId
          ? c
          : {
              ...c,
              clues: c.clues.map((cl) =>
                cl.id === clueId ? { ...cl, answered: false, revealed: false } : cl
              ),
            }
      )
    );
    setActiveClueId(null);
  }

  function handleRestartBoard() {
    setCategories((cs) =>
      cs.map((c) => ({
        ...c,
        clues: c.clues.map((cl) => ({ ...cl, answered: false, revealed: false })),
      }))
    );
    setConfirmingRestart(false);
  }

  function handleAward(teamId: string, delta: number) {
    setTeams((ts) => ts.map((t) => (t.id === teamId ? { ...t, score: t.score + delta } : t)));
  }

  function handleAddTeam() {
    setTeams((ts) => [
      ...ts,
      {
        id: newId(),
        name: `Team ${ts.length + 1}`,
        color: nextTeamColor(ts.map((t) => t.color)),
        score: 0,
      },
    ]);
  }

  function handleRenameTeam(teamId: string, name: string) {
    setTeams((ts) => ts.map((t) => (t.id === teamId ? { ...t, name } : t)));
  }

  function handleColorTeam(teamId: string, color: string) {
    setTeams((ts) => ts.map((t) => (t.id === teamId ? { ...t, color } : t)));
  }

  function handleRemoveTeam(teamId: string) {
    setTeams((ts) => ts.filter((t) => t.id !== teamId));
  }

  const isDemo = initialGame.id === DEMO_GAME_ID;
  const iconButton =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border-2 border-ink sm:hidden";

  return (
    <div className="flex min-h-screen flex-col bg-background text-ink">
      <header className="flex items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-7 sm:py-4">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          <Link
            href="/"
            aria-label="Oasis Quiz home"
            className="flex h-11 w-11 shrink-0 items-center justify-center"
          >
            <LogoMark size={30} />
          </Link>
          <h1 className="line-clamp-2 break-words font-display text-[19px] font-extrabold leading-tight text-ink sm:block sm:truncate sm:text-2xl sm:leading-8">
            {initialGame.title || "Untitled Game"}
          </h1>
          <span className="hidden shrink-0 text-sm text-ink-faint md:inline">
            {answeredClues} of {totalClues} played
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <div className="hidden lg:block">
            <SaveStatusIndicator status={status} />
          </div>
          {confirmingRestart ? (
            <div className="-my-1 flex items-center gap-1.5 rounded-[14px] border-2 border-ink bg-white p-1 pl-3 text-sm font-bold">
              <span className="hidden sm:inline">Restart board?</span>
              <Button variant="danger" size="sm" onClick={handleRestartBoard}>
                Restart
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingRestart(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden sm:flex">
                <Button variant="outline" onClick={() => setConfirmingRestart(true)}>
                  Restart
                </Button>
              </div>
              <button
                type="button"
                onClick={() => setConfirmingRestart(true)}
                aria-label="Restart board"
                className={`${iconButton} bg-white`}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M3 8a5 5 0 1 1 1.6 3.66M3 8V4.5M3 8h3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}
          <div className="hidden sm:flex">
            <Link href={`/game/${initialGame.id}/edit`} className={buttonClasses("primary")}>
              {isDemo ? "Edit a copy" : "Edit board"}
            </Link>
          </div>
          <Link
            href={`/game/${initialGame.id}/edit`}
            aria-label={isDemo ? "Edit a copy" : "Edit board"}
            className={`${iconButton} bg-ink text-white`}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10.5 2.5l3 3L6 13H3v-3l7.5-7.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 pb-6 sm:px-7 lg:flex-row lg:items-start lg:gap-7">
        <div className="lg:min-w-0 lg:flex-1">
          {boardComplete && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border-2 border-ink bg-accent px-4 py-3">
              <span className="font-display text-lg font-extrabold">
                Board complete! Every clue has been played.
              </span>
              <Button variant="outline" size="sm" onClick={handleRestartBoard}>
                Play again
              </Button>
            </div>
          )}
          <GameBoard categories={categories} onSelectClue={handleSelectClue} />
        </div>

        {teams.length === 0 ? (
          <aside className="flex w-full shrink-0 flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed border-line p-6 text-center lg:w-80">
            <p className="text-ink-soft">No teams yet. Add one to start keeping score.</p>
            <AddTeamPrompt onAdd={handleAddTeam} />
          </aside>
        ) : (
          <Scoreboard
            teams={teams}
            onAdjust={handleAward}
            onRename={handleRenameTeam}
            onColorChange={handleColorTeam}
            onRemove={handleRemoveTeam}
            onAdd={handleAddTeam}
          />
        )}
      </main>

      {activeClue && activeCategory && (
        <ClueModal
          category={activeCategory}
          categoryColor={resolveCategoryColor(activeCategory, categories.indexOf(activeCategory))}
          clue={activeClue}
          timeLimit={effectiveTimeLimit(activeClue, initialGame)}
          teams={teams}
          onAward={handleAward}
          onClose={handleCloseClue}
          onCancel={handleCancelClue}
          onReset={handleResetClue}
        />
      )}
    </div>
  );
}
