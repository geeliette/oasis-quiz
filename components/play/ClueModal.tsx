"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import type { Category, Clue, Team } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { QuestionTimer } from "./QuestionTimer";

interface ClueModalProps {
  category: Category;
  categoryColor: string;
  clue: Clue;
  /** Seconds for this question's timer; 0 means it has none. */
  timeLimit: number;
  teams: Team[];
  onAward: (teamId: string, delta: number) => void;
  onClose: () => void;
  onCancel: () => void;
  onReset: () => void;
}

export function ClueModal({
  category,
  categoryColor,
  clue,
  timeLimit,
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

  const steps = ["Question", ...(hasHint ? ["Clue"] : []), "Answer"];
  const currentStep = phase === "answer" ? steps.length - 1 : hintShown ? 1 : 0;

  const sticker =
    "absolute rounded-[12px] border-2 border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider sm:px-4 sm:py-2 sm:text-[15px]";
  const valueSticker =
    "absolute -right-2 -top-6 flex h-14 w-14 rotate-[8deg] items-center justify-center rounded-full border-2 border-ink bg-accent font-display text-xl font-extrabold sm:right-10 sm:-top-7 sm:h-[76px] sm:w-[76px] sm:text-[26px]";
  // Both faces share one grid cell so the card grows to fit the taller one.
  const face =
    "backface-hidden relative col-start-1 row-start-1 flex flex-col items-center justify-center rounded-[24px] border-2 border-ink bg-white px-5 pb-8 pt-12 text-center shadow-[8px_8px_0_var(--color-ink)] sm:rounded-[32px] sm:px-14 sm:pb-14 sm:pt-[72px] sm:shadow-[10px_10px_0_var(--color-ink)]";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col gap-4 overflow-y-auto bg-background/75 backdrop-blur-[3px] px-4 py-4 text-ink sm:px-7 sm:py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between gap-3">
          {clue.answered ? (
            <div className="flex items-center gap-2.5">
              <span className="hidden items-center gap-1.5 rounded-full bg-surface-soft px-3.5 py-2 text-sm font-bold text-ink-soft sm:inline-flex">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
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
              <Button variant="accent" onClick={onReset}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M3 8a5 5 0 1 1 1.6 3.66M3 8V4.5M3 8h3.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Mark as unplayed
              </Button>
            </div>
          ) : (
            <ol className="flex items-center gap-1.5 text-xs font-bold sm:gap-2 sm:text-sm">
              {steps.map((step, i) => (
                <li
                  key={step}
                  aria-current={i === currentStep ? "step" : undefined}
                  className={clsx(
                    "rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5",
                    i === currentStep
                      ? "border-2 border-ink bg-ink text-white"
                      : i < currentStep
                        ? "border-2 border-ink text-ink"
                        : "border-2 border-line text-ink-faint"
                  )}
                >
                  {i + 1} · {step}
                </li>
              ))}
            </ol>
          )}

          <Button variant="outline" onClick={handleExit} aria-label="Close clue" className="shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Close</span>
            <kbd className="hidden rounded-md bg-surface-soft px-1.5 py-0.5 font-sans text-xs font-bold text-ink-soft sm:inline">
              Esc
            </kbd>
          </Button>
        </div>

        <div className="perspective flex w-full flex-1 items-center justify-center py-6">
          <motion.div
            className="preserve-3d relative grid min-h-[420px] w-full max-w-[920px] cursor-pointer sm:min-h-[460px]"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: phase === "answer" ? 180 : 0 }}
            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
            onClick={advance}
          >
            {/* Front: question */}
            <div className={clsx(face, "gap-7 sm:gap-9")}>
              <span
                className={clsx(sticker, "-top-4 left-5 -rotate-[4deg] sm:-top-5 sm:left-10")}
                style={{ background: categoryColor }}
              >
                {category.name}
              </span>
              <span className={valueSticker}>{clue.value}</span>

              <p
                className={clsx(
                  "whitespace-pre-line font-display font-extrabold leading-tight tracking-[-0.02em] sm:leading-[1.1]",
                  questionSize(clue.question)
                )}
              >
                {clue.question}
              </p>
              {hintShown && hasHint && (
                <div className="flex max-w-[680px] flex-col items-center gap-2 rounded-[16px] bg-surface-soft px-5 py-3.5 sm:flex-row sm:gap-3 sm:text-left">
                  <span className="shrink-0 rounded-full border-2 border-ink bg-teal px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                    Clue
                  </span>
                  <p className="whitespace-pre-line text-lg font-medium leading-snug text-ink sm:text-xl">
                    {clue.hint}
                  </p>
                </div>
              )}
              {timeLimit > 0 && <QuestionTimer seconds={timeLimit} frozen={phase === "answer"} />}
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                {hasHint && !hintShown && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHintShown(true);
                    }}
                  >
                    Show clue
                  </Button>
                )}
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhase("answer");
                  }}
                >
                  Reveal answer
                </Button>
              </div>
              <p className="hidden text-[15px] text-ink-faint sm:block">
                Press{" "}
                <kbd className="rounded-md bg-surface-soft px-2 py-0.5 font-sans font-bold text-ink">
                  Space
                </kbd>{" "}
                to reveal
                {timeLimit > 0 && (
                  <>
                    {" · "}
                    <kbd className="rounded-md bg-surface-soft px-2 py-0.5 font-sans font-bold text-ink">
                      T
                    </kbd>{" "}
                    to start or pause the timer
                  </>
                )}
              </p>
            </div>

            {/* Back: answer + scoring */}
            <div
              className={clsx(face, "cursor-default gap-6")}
              style={{ transform: "rotateY(180deg)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className={clsx(sticker, "-top-4 left-5 -rotate-[4deg] bg-teal sm:-top-5 sm:left-10")}>
                Answer
              </span>
              <span className={valueSticker}>{clue.value}</span>

              <p
                className={clsx(
                  "whitespace-pre-line font-display font-extrabold leading-tight",
                  answerSize(clue.answer)
                )}
              >
                {clue.answer}
              </p>

              {teams.length > 0 && (
                <div className="flex w-full flex-wrap items-center justify-center gap-2.5 border-t-2 border-dashed border-line pt-5">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center gap-1.5 rounded-[14px] border-2 border-ink bg-white py-1 pl-3 pr-1"
                    >
                      <span
                        className="h-3 w-3 rounded-full border-2 border-ink"
                        style={{ background: team.color }}
                        aria-hidden
                      />
                      <span className="max-w-[7rem] truncate pr-1 text-sm font-bold">{team.name}</span>
                      <button
                        type="button"
                        onClick={() => onAward(team.id, -clue.value)}
                        className="flex h-11 min-w-11 items-center justify-center rounded-[10px] px-2 text-sm font-bold transition-colors hover:bg-surface-soft"
                        aria-label={`Take ${clue.value} from ${team.name}`}
                      >
                        −{clue.value}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAward(team.id, clue.value)}
                        className="flex h-11 min-w-11 items-center justify-center rounded-[10px] bg-ink px-2.5 text-sm font-bold text-white transition-transform active:scale-95"
                        aria-label={`Give ${clue.value} to ${team.name}`}
                      >
                        +{clue.value}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" onClick={onClose}>
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Step the type down for longer text so it stays readable without the card
// growing taller than the screen.
function questionSize(text: string) {
  if (text.length > 220) return "text-xl sm:text-[30px]";
  if (text.length > 140) return "text-[22px] sm:text-[36px]";
  if (text.length > 80) return "text-2xl sm:text-[44px]";
  return "text-[28px] sm:text-[52px]";
}

function answerSize(text: string) {
  if (text.length > 160) return "text-lg sm:text-[26px]";
  if (text.length > 80) return "text-xl sm:text-[32px]";
  return "text-2xl sm:text-[40px]";
}
