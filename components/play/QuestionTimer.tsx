"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { formatClock, formatDuration, timerOptions } from "@/lib/timer";
import { Button } from "@/components/ui/Button";
import { TimerIcon } from "@/components/ui/Icons";

type Status = "idle" | "running" | "paused" | "done";

const WARNING_SECONDS = 5;

/** True when a key press belongs to a form control (e.g. a focused dropdown), not the card. */
export function isFromFormControl(e: KeyboardEvent) {
  return e.target instanceof Element && !!e.target.closest("select, input, textarea");
}

/**
 * A countdown the host starts by hand. Before it starts, the host can change
 * the length (or add a timer to an untimed question) via `onChangeSeconds`.
 * `frozen` stops it for good once the answer is revealed, leaving the last
 * time on screen as the card flips.
 */
export function QuestionTimer({
  seconds,
  frozen,
  onChangeSeconds,
}: {
  /** 0 means the question has no timer. */
  seconds: number;
  frozen: boolean;
  onChangeSeconds: (seconds: number) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [remainingMs, setRemainingMs] = useState(seconds * 1000);
  // When the running countdown hits zero; measuring against the clock keeps it
  // accurate even if the interval fires late (e.g. in a background tab).
  const endAtRef = useRef(0);

  function start() {
    endAtRef.current = Date.now() + remainingMs;
    setStatus("running");
  }
  function pause() {
    setRemainingMs(Math.max(0, endAtRef.current - Date.now()));
    setStatus("paused");
  }
  function restart() {
    endAtRef.current = Date.now() + seconds * 1000;
    setRemainingMs(seconds * 1000);
    setStatus("running");
  }
  function toggle() {
    if (status === "running") pause();
    else if (status === "done") restart();
    else start();
  }

  useEffect(() => {
    if (status !== "running" || frozen) return;
    const interval = setInterval(() => {
      const left = endAtRef.current - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        setStatus("done");
      } else {
        setRemainingMs(left);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [status, frozen]);

  useEffect(() => {
    if (frozen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.code !== "KeyT" || e.repeat || e.metaKey || e.ctrlKey || e.altKey || isFromFormControl(e)) return;
      if (seconds === 0) return;
      e.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frozen, status, remainingMs, seconds]);

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const done = status === "done";
  const warning = done || (status !== "idle" && secondsLeft <= WARNING_SECONDS);

  // Clicks here shouldn't fall through to the card, which would reveal the answer.
  if (seconds === 0) {
    if (frozen) return null;
    return (
      <label
        className="relative inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-sm font-bold text-ink-faint transition-colors focus-within:ring-2 focus-within:ring-accent hover:bg-surface-soft hover:text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <TimerIcon />
        Add timer
        <select
          value=""
          onChange={(e) => onChangeSeconds(Number(e.target.value))}
          aria-label="Add a timer to this question"
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          <option value="" disabled>
            Add timer
          </option>
          {timerOptions(undefined).map((s) => (
            <option key={s} value={s}>
              {formatDuration(s)}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (status === "idle") {
    return (
      <div
        className={clsx(
          "inline-flex min-h-[52px] items-stretch rounded-[14px] border-2 border-ink bg-white text-[1.05rem] font-bold shadow-[var(--shadow-hard)]",
          frozen && "pointer-events-none opacity-40 shadow-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={start}
          disabled={frozen}
          className="flex items-center gap-2.5 rounded-l-[12px] px-5 transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        >
          <TimerIcon size={18} />
          Start timer
        </button>
        <span className="relative flex items-center border-l-2 border-ink">
          <select
            value={seconds}
            onChange={(e) => onChangeSeconds(Number(e.target.value))}
            disabled={frozen}
            aria-label="Timer length for this question"
            className="h-full cursor-pointer appearance-none rounded-r-[12px] bg-transparent pl-4 pr-9 font-display font-extrabold tabular-nums outline-none transition-colors hover:bg-surface-soft focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
          >
            <option value="0">No timer</option>
            {timerOptions(seconds).map((s) => (
              <option key={s} value={s}>
                {formatClock(s)}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 text-ink-soft"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex w-full max-w-[440px] cursor-default flex-col items-center gap-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3">
        <span
          className={clsx(
            "font-display text-4xl font-extrabold tabular-nums sm:text-5xl",
            warning && "text-danger",
            done ? "animate-pop" : warning && status === "running" && "animate-pulse"
          )}
        >
          {done ? "Time's up!" : formatClock(secondsLeft)}
        </span>
        {!done && (
          <TimerButton
            label={status === "running" ? "Pause timer" : "Resume timer"}
            onClick={status === "running" ? pause : start}
            disabled={frozen}
          >
            {status === "running" ? (
              <>
                <rect x="5" y="3.5" width="4.5" height="17" rx="1.2" fill="currentColor" />
                <rect x="14.5" y="3.5" width="4.5" height="17" rx="1.2" fill="currentColor" />
              </>
            ) : (
              <path d="M6.5 3.6v16.8a1 1 0 0 0 1.5.86l14-8.4a1 1 0 0 0 0-1.72l-14-8.4a1 1 0 0 0-1.5.86Z" fill="currentColor" />
            )}
          </TimerButton>
        )}
        <TimerButton label="Restart timer" onClick={restart} disabled={frozen}>
          <path
            d="M3 12a9 9 0 1 0 2.64-6.36L3 8.28M3 3v5.28h5.28"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </TimerButton>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-surface-soft">
        <div
          className={clsx("h-full transition-[width] duration-100 ease-linear", warning ? "bg-danger" : "bg-teal")}
          style={{ width: `${(remainingMs / (seconds * 1000)) * 100}%` }}
        />
      </div>
      <span className="sr-only" aria-live="assertive">
        {done ? "Time's up" : ""}
      </span>
    </div>
  );
}

function TimerButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    // px-0! beats the padding the button's size adds, which would squeeze the icon.
    <Button variant="outline" onClick={onClick} disabled={disabled} aria-label={label} className="w-11 px-0!">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
        {children}
      </svg>
    </Button>
  );
}
