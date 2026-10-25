"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Category, Game, Team } from "@/lib/types";
import { newId } from "@/lib/id";
import { nextTeamColor } from "./teamColors";
import { useAutosaveGame } from "@/hooks/useAutosaveGame";
import { SaveStatusIndicator } from "@/components/ui/SaveStatus";
import { GameBoard } from "./GameBoard";
import { ClueModal } from "./ClueModal";
import { Scoreboard, AddTeamPrompt } from "./Scoreboard";
import { DEMO_GAME_ID } from "@/lib/demo";

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

  return (
    <div className="relative min-h-screen text-white">
      <div
        className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,var(--color-stage-mid),var(--color-stage-start)_60%)]"
        aria-hidden
      />
      <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/" className="shrink-0 text-xl" aria-label="Oasis Quiz home">
            🏝️
          </Link>
          <h1 className="truncate font-display text-lg font-bold text-white/90 sm:text-xl">
            {initialGame.title || "Untitled Game"}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <SaveStatusIndicator status={status} />
          {confirmingRestart ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-white/10 p-1 text-xs font-bold">
              <span className="pl-1.5 text-white/70">Restart board?</span>
              <button
                type="button"
                onClick={handleRestartBoard}
                className="rounded-md bg-danger px-2.5 py-1 text-white transition-colors hover:bg-danger-dark"
              >
                Yes, restart
              </button>
              <button
                type="button"
                onClick={() => setConfirmingRestart(false)}
                className="rounded-md px-2.5 py-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingRestart(true)}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80 transition-colors hover:bg-white/20"
            >
              Restart board
            </button>
          )}
          <Link
            href={`/game/${initialGame.id}/edit`}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80 transition-colors hover:bg-white/20"
          >
            {initialGame.id === DEMO_GAME_ID ? "Edit a copy" : "Edit board"}
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 sm:px-6 lg:flex-row">
        <div className="flex-1">
          {boardComplete && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3">
              <span className="font-display text-sm font-bold text-accent">
                Board complete! Every clue has been played.
              </span>
              <button
                type="button"
                onClick={handleRestartBoard}
                className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-bold text-[#3a2600] transition-transform hover:-translate-y-0.5"
              >
                Restart board
              </button>
            </div>
          )}
          <GameBoard categories={categories} onSelectClue={handleSelectClue} />
        </div>

        {teams.length === 0 ? (
          <aside className="flex w-full shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-center lg:w-72">
            <p className="text-sm text-white/60">No teams yet. Add one to start keeping score.</p>
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
          clue={activeClue}
          teams={teams}
          onAward={handleAward}
          onClose={handleCloseClue}
          onCancel={handleCancelClue}
          onReset={handleResetClue}
        />
      )}
      </div>
    </div>
  );
}
