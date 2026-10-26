"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { formatClock } from "@/lib/timer";
import { Button } from "@/components/ui/Button";
import { TimerIcon } from "@/components/ui/Icons";

type Status = "idle" | "running" | "paused" | "done";

const WARNING_SECONDS = 5;

/**
 * A countdown the host starts by hand. `frozen` stops it for good once the
 * answer is revealed, leaving the last time on screen as the card flips.
 */
export function QuestionTimer({ seconds, frozen }: { seconds: number; frozen: boolean }) {
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
      if (e.code !== "KeyT" || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frozen, status, remainingMs]);

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const done = status === "done";
  const warning = done || (status !== "idle" && secondsLeft <= WARNING_SECONDS);

  // Clicks here shouldn't fall through to the card, which would reveal the answer.
  if (status === "idle") {
    return (
      <Button
        variant="outline"
        size="lg"
        disabled={frozen}
        onClick={(e) => {
          e.stopPropagation();
          start();
        }}
      >
        <TimerIcon size={18} />
        Start timer · {formatClock(seconds)}
      </Button>
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
