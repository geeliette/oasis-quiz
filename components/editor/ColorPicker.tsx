"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CATEGORY_COLOR_OPTIONS } from "@/components/play/teamColors";

const COLOR_NAMES: Record<string, string> = {
  "#FF5A3C": "Tomato",
  "#FFC53D": "Sun",
  "#3DD9A5": "Mint",
  "#4DA8FF": "Sky",
  "#B18CFF": "Lilac",
  "#FF8FB8": "Pink",
  "#FF9F45": "Orange",
  "#9BE15D": "Lime",
};

export function ColorPicker({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close when clicking elsewhere or pressing Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Colour for ${label}`}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-[10px] text-ink transition-colors hover:bg-white/40"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M9 2a7 7 0 1 0 0 14c1 0 1.5-.6 1.5-1.4 0-.9-.7-1.2-.7-2s.6-1.4 1.6-1.4H13a3 3 0 0 0 3-3C16 4.9 12.9 2 9 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="5.5" cy="8" r="1.1" fill="currentColor" />
          <circle cx="8" cy="5.2" r="1.1" fill="currentColor" />
          <circle cx="11.5" cy="5.8" r="1.1" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          role="group"
          aria-label={`Colours for ${label}`}
          className="absolute left-0 top-full z-20 mt-2 grid w-[196px] grid-cols-4 gap-2 rounded-[14px] border-2 border-ink bg-white p-2.5 shadow-[var(--shadow-hard)]"
        >
          {CATEGORY_COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onChange(color);
                setOpen(false);
              }}
              aria-label={COLOR_NAMES[color] ?? color}
              aria-pressed={value === color}
              title={COLOR_NAMES[color]}
              className={clsx(
                "h-10 w-10 rounded-full border-2 border-ink transition-transform hover:scale-110",
                value === color && "ring-2 ring-ink ring-offset-2"
              )}
              style={{ background: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
