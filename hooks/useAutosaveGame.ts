import { useEffect, useRef, useState } from "react";
import type { Game, GameUpdate } from "@/lib/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounces writes of a game's mutable fields to the server so rapid edits
 * (typing, clicking tiles, adjusting scores) collapse into a single PUT.
 */
export function useAutosaveGame(
  gameId: string,
  payload: GameUpdate,
  options: { enabled: boolean; delay?: number }
) {
  const { enabled, delay = 900 } = options;
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPayload = useRef(payload);
  const isFirstRun = useRef(true);

  latestPayload.current = payload;

  useEffect(() => {
    if (!enabled) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus("saving");

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/games/${gameId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(latestPayload.current),
        });
        if (!res.ok) throw new Error("save failed");
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(payload), enabled, gameId]);

  async function saveNow(): Promise<Game | null> {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus("saving");
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(latestPayload.current),
      });
      if (!res.ok) throw new Error("save failed");
      const game = (await res.json()) as Game;
      setStatus("saved");
      return game;
    } catch {
      setStatus("error");
      return null;
    }
  }

  return { status, saveNow };
}
