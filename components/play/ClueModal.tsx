"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, Clue, Team } from "@/lib/types";

interface ClueModalProps {
  category: Category;
  clue: Clue;
  teams: Team[];
  onAward: (teamId: string, delta: number) => void;
  onClose: () => void;
  onCancel: () => void;
  onReset: () => void;
}

export function ClueModal({
  category,
  clue,
  teams,
  onAward,
  onClose,
  onCancel,
  onReset,
}: ClueModalProps) {
  const [phase, setPhase] = useState<"question" | "answer">("question");
  const [hintShown, setHintShown] = useState(false);
  const hasHint = !!clue.hint?.trim();

  function handleExit() {
    if (phase === "question") {
      onCancel();
    } else {
      onClose();
    }
  }

  function advance() {
    if (phase !== "question") return;
    if (hasHint && !hintShown) {
      setHintShown(true);
    } else {
      setPhase("answer");
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        advance();
      } else if (e.code === "Escape") {
        e.preventDefault();
        handleExit();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, hintShown]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_50%_20%,var(--color-stage-mid),var(--color-stage-start))]/95 p-4 backdrop-blur-sm sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {clue.answered && (
          <div className="absolute left-4 top-4 flex items-center gap-2.5 sm:left-8 sm:top-8">
            <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-sm font-bold text-white/90 sm:inline-flex">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3.5 8.5l3 3 6-7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Already played
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="flex items-center gap-2 rounded-full border-2 border-accent bg-accent/15 px-4 py-2 font-display text-sm font-bold text-accent shadow-[0_4px_0_rgba(0,0,0,0.2)] transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-[#3a2600] active:translate-y-0 sm:px-5 sm:py-2.5 sm:text-base"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8a5 5 0 1 1 1.6 3.66M3 8V4.5M3 8h3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Mark as unplayed
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleExit();
          }}
          aria-label="Close clue"
          className="absolute right-4 top-4 flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border-2 border-white/70 bg-white/15 px-3 font-display text-base font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[var(--color-stage-start)] active:translate-y-0 sm:right-8 sm:top-8 sm:h-12 sm:px-4"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">Close</span>
          <kbd className="hidden rounded-md bg-black/20 px-1.5 py-0.5 font-sans text-xs font-semibold opacity-80 sm:inline">
            Esc
          </kbd>
        </button>

        <div className="perspective w-full max-w-4xl">
          <motion.div
            className="preserve-3d relative min-h-[420px] w-full cursor-pointer sm:min-h-[480px]"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: phase === "answer" ? 180 : 0 }}
            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
            onClick={advance}
          >
            {/* Front: question */}
            <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[var(--color-tile-start)] to-[var(--color-tile-end)] p-8 text-center shadow-[var(--shadow-pop)] sm:p-14">
              <span className="rounded-full bg-white/15 px-4 py-1.5 font-display text-sm font-bold uppercase tracking-wide text-white/90">
                {category.name} · {clue.value} pts
              </span>
              <p className="whitespace-pre-line font-display text-2xl font-bold leading-snug text-white sm:text-4xl">
                {clue.question}
              </p>
              {hintShown && hasHint && (
                <div className="flex flex-col items-center gap-1.5">
                  <span className="rounded-full bg-accent/20 px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-accent">
                    Clue
                  </span>
                  <p className="whitespace-pre-line text-lg font-medium leading-snug text-white/85 sm:text-xl">
                    {clue.hint}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {hasHint && !hintShown && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHintShown(true);
                    }}
                    className="rounded-2xl bg-white/15 px-6 py-3 font-display font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Show Clue
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhase("answer");
                  }}
                  className="rounded-2xl bg-accent px-6 py-3 font-display font-bold text-[#3a2600] shadow-[0_4px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Reveal Answer
                </button>
              </div>
              <span className="text-xs font-medium text-white/50">
                Press space or click the card
              </span>
            </div>

            {/* Back: answer + scoring */}
            <div
              className="backface-hidden absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1a0505] to-[var(--color-stage-end)] p-6 text-center shadow-[var(--shadow-pop)] sm:p-10"
              style={{ transform: "rotateY(180deg)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="rounded-full bg-accent/20 px-4 py-1.5 font-display text-sm font-bold uppercase tracking-wide text-accent">
                Answer
              </span>
              <p className="whitespace-pre-line font-display text-xl font-bold leading-snug text-white sm:text-3xl">
                {clue.answer}
              </p>

              {teams.length > 0 && (
                <div className="flex w-full flex-wrap items-center justify-center gap-2.5 border-t border-white/10 pt-5">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center gap-1.5 rounded-xl bg-white/10 py-1.5 pl-3 pr-1.5"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: team.color }}
                      />
                      <span className="max-w-[7rem] truncate text-sm font-semibold text-white">
                        {team.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => onAward(team.id, clue.value)}
                        className="rounded-lg bg-success/90 px-2 py-1 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95"
                        aria-label={`Award ${clue.value} to ${team.name}`}
                      >
                        +{clue.value}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAward(team.id, -clue.value)}
                        className="rounded-lg bg-danger/90 px-2 py-1 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95"
                        aria-label={`Deduct ${clue.value} from ${team.name}`}
                      >
                        −{clue.value}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl bg-white/15 px-6 py-2.5 font-display font-bold text-white transition-colors hover:bg-white/25"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
