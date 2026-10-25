"use client";

import { useState } from "react";
import clsx from "clsx";
import type { Team } from "@/lib/types";
import { TEAM_COLORS } from "./teamColors";
import { Button } from "@/components/ui/Button";

interface ScoreboardProps {
  teams: Team[];
  onAdjust: (teamId: string, delta: number) => void;
  onRename: (teamId: string, name: string) => void;
  onColorChange: (teamId: string, color: string) => void;
  onRemove: (teamId: string) => void;
  onAdd: () => void;
}

export function Scoreboard({
  teams,
  onAdjust,
  onRename,
  onColorChange,
  onRemove,
  onAdd,
}: ScoreboardProps) {
  const [managing, setManaging] = useState(false);

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 lg:h-full lg:w-72 lg:p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white/70">
          Scoreboard
        </h2>
        <button
          type="button"
          onClick={() => setManaging((m) => !m)}
          className={clsx(
            "rounded-lg px-2.5 py-1 text-xs font-bold transition-colors",
            managing ? "bg-accent text-[#3a2600]" : "bg-white/10 text-white/70 hover:bg-white/20"
          )}
        >
          {managing ? "Done" : "Manage teams"}
        </button>
      </div>

      {teams.length === 0 && (
        <p className="rounded-xl bg-white/5 p-3 text-center text-sm text-white/50">
          No teams yet — add one to start keeping score.
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:grid-cols-3 sm:gap-2.5 lg:flex lg:flex-col">
        {teams.map((team) =>
          managing ? (
            <TeamEditRow
              key={team.id}
              team={team}
              onRename={(name) => onRename(team.id, name)}
              onColorChange={(color) => onColorChange(team.id, color)}
              onRemove={() => onRemove(team.id)}
            />
          ) : (
            <TeamScoreRow
              key={team.id}
              team={team}
              onAdjust={(delta) => onAdjust(team.id, delta)}
            />
          )
        )}
      </div>

      {managing && (
        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl border-2 border-dashed border-white/20 py-2 text-sm font-bold text-white/70 transition-colors hover:border-white/40 hover:text-white"
        >
          + Add team
        </button>
      )}
    </aside>
  );
}

function TeamScoreRow({
  team,
  onAdjust,
}: {
  team: Team;
  onAdjust: (delta: number) => void;
}) {
  const [customAmount, setCustomAmount] = useState("100");
  const amount = Math.abs(Number(customAmount)) || 0;

  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl bg-white/8 p-2.5 sm:p-3">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: team.color }} />
        <span className="min-w-0 flex-1 truncate font-display text-sm font-bold text-white sm:text-base">
          {team.name}
        </span>
        <span
          key={team.score}
          className="animate-pop font-display text-xl font-extrabold text-accent tabular-nums sm:text-2xl"
        >
          {team.score}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onAdjust(-amount)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/80 font-bold text-white transition-transform hover:scale-105 active:scale-95"
          aria-label={`Subtract points from ${team.name}`}
        >
          −
        </button>
        <input
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="w-0 min-w-10 flex-1 rounded-lg border border-white/15 bg-white/10 px-1.5 py-1 text-center text-xs font-semibold text-white outline-none focus:border-white/40"
        />
        <button
          type="button"
          onClick={() => onAdjust(amount)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/80 font-bold text-white transition-transform hover:scale-105 active:scale-95"
          aria-label={`Add points to ${team.name}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function TeamEditRow({
  team,
  onRename,
  onColorChange,
  onRemove,
}: {
  team: Team;
  onRename: (name: string) => void;
  onColorChange: (color: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl bg-white/8 p-2.5 sm:p-3">
      <div className="flex items-center gap-2">
        <input
          value={team.name}
          onChange={(e) => onRename(e.target.value)}
          placeholder="Team name"
          className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-sm font-semibold text-white outline-none focus:border-white/40"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${team.name}`}
          className="shrink-0 rounded-lg p-1.5 text-white/60 transition-colors hover:bg-danger/20 hover:text-danger"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TEAM_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColorChange(c)}
            aria-label={`Set color ${c}`}
            className={clsx(
              "h-5 w-5 rounded-full transition-transform hover:scale-110",
              team.color === c && "ring-2 ring-white ring-offset-2 ring-offset-transparent"
            )}
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  );
}

export function AddTeamPrompt({ onAdd }: { onAdd: () => void }) {
  return (
    <Button variant="accent" onClick={onAdd}>
      + Add your first team
    </Button>
  );
}
