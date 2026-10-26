"use client";

import clsx from "clsx";
import { formatDuration, timerOptions } from "@/lib/timer";
import { TimerIcon } from "@/components/ui/Icons";

const DEFAULT = "default";

/**
 * Picks a timer length in seconds (0 = off). With `boardDefault` set it also
 * offers "use the board's default", reported as undefined.
 */
export function TimerSelect({
  id,
  value,
  onChange,
  boardDefault,
  className,
}: {
  id: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  boardDefault?: number;
  className?: string;
}) {
  const usesDefault = boardDefault !== undefined;

  return (
    <div
      className={clsx(
        "relative inline-flex h-10 items-center rounded-[10px] border-2 border-field bg-white text-sm font-bold text-ink focus-within:border-ink focus-within:ring-2 focus-within:ring-accent",
        className
      )}
    >
      <span className="pointer-events-none absolute left-2.5 text-ink-soft">
        <TimerIcon />
      </span>
      <select
        id={id}
        value={value === undefined && usesDefault ? DEFAULT : String(value ?? 0)}
        onChange={(e) => onChange(e.target.value === DEFAULT ? undefined : Number(e.target.value))}
        className="h-full w-full cursor-pointer appearance-none rounded-[10px] bg-transparent pl-8 pr-8 outline-none"
      >
        {usesDefault && (
          <option value={DEFAULT}>
            Board default ({boardDefault ? formatDuration(boardDefault) : "off"})
          </option>
        )}
        <option value="0">No timer</option>
        {timerOptions(value).map((s) => (
          <option key={s} value={s}>
            {formatDuration(s)}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 text-ink-soft"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
      >
        <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
