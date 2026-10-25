"use client";

import { useState } from "react";
import clsx from "clsx";

export function CopyLinkField({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API unavailable; fall back to manual select via the readonly input.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex items-center gap-2 rounded-[14px] border-2 border-ink bg-white p-1 pl-3.5">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        aria-label="Share link"
        className="min-w-0 flex-1 truncate bg-transparent text-sm font-medium text-ink-soft outline-none"
      />
      {/* Flat on purpose: a hard shadow would spill over the field's border. */}
      <button
        type="button"
        onClick={handleCopy}
        className={clsx(
          "min-h-10 shrink-0 rounded-[10px] px-3.5 text-sm font-bold transition-colors",
          copied ? "bg-teal text-ink" : "bg-ink text-white hover:bg-ink-soft"
        )}
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
