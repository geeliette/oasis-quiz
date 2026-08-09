"use client";

import { useState } from "react";
import { Button } from "./Button";

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
    <div className="flex items-center gap-2 rounded-md border-2 border-border bg-white p-1.5 pl-4">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 truncate bg-transparent text-sm font-medium text-ink-soft outline-none"
      />
      <Button size="sm" variant={copied ? "success" : "primary"} onClick={handleCopy} type="button">
        {copied ? "Copied!" : "Copy link"}
      </Button>
    </div>
  );
}
