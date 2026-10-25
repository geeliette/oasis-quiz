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
  const [perTap, setPerTap] = useState("100");
  const amount = Math.abs(Number(perTap)) || 0;

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-80">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h2 className="font-display text-[22px] font-extrabold text-ink">Scores</h2>
        <div className="flex items-center gap-2">
          {!managing && (
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              Points per tap
              <input
                type="number"
                min={0}
                value={perTap}
                onChange={(e) => setPerTap(e.target.value)}
                className="h-10 w-[72px] rounded-[10px] border-2 border-ink bg-white text-center font-bold text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>
          )}
          <Button
            variant={managing ? "accent" : "ghost"}
            size="sm"
            onClick={() => setManaging((m) => !m)}
          >
            {managing ? "Done" : "Manage"}
          </Button>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
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
              onMinus={() => onAdjust(team.id, -amount)}
              onPlus={() => onAdjust(team.id, amount)}
            />
          )
        )}
      </div>

      {managing && (
        <button
          type="button"
          onClick={onAdd}
          className="min-h-11 rounded-[14px] border-2 border-dashed border-line font-bold text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          + Add team
        </button>
      )}
    </aside>
  );
}

function TeamScoreRow({
  team,
  onMinus,
  onPlus,
}: {
  team: Team;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[14px] border-2 border-ink bg-white py-2 pl-3.5 pr-2">
      <span
        className="h-3 w-3 shrink-0 rounded-full border-2 border-ink"
        style={{ background: team.color }}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate font-bold text-ink">{team.name}</span>
      <span
        key={team.score}
        className="animate-pop pr-1 font-display text-2xl font-extrabold tabular-nums text-ink"
      >
        {team.score}
      </span>
      <button
        type="button"
        onClick={onMinus}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border-2 border-ink bg-white transition-transform active:scale-95"
        aria-label={`Take points from ${team.name}`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3 8h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onPlus}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border-2 border-ink bg-ink text-white transition-transform active:scale-95"
        aria-label={`Give points to ${team.name}`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>
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
    <div className="flex min-w-0 flex-col gap-2.5 rounded-[14px] border-2 border-ink bg-white p-3">
      <div className="flex items-center gap-2">
        <input
          value={team.name}
          onChange={(e) => onRename(e.target.value)}
          placeholder="Team name"
          aria-label="Team name"
          className="h-11 min-w-0 flex-1 rounded-[10px] border-2 border-border bg-white px-3 font-semibold text-ink outline-none focus:border-ink"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${team.name}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {TEAM_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColorChange(c)}
            aria-label={`Set colour ${c}`}
            aria-pressed={team.color === c}
            className={clsx(
              "h-8 w-8 rounded-full border-2 border-ink transition-transform hover:scale-110",
              team.color === c && "ring-2 ring-ink ring-offset-2"
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
