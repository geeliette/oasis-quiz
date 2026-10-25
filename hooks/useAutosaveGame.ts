import { useCallback, useEffect, useRef, useState } from "react";
import type { GameUpdate } from "@/lib/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "failed";

const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 15000];

/**
 * Debounces writes of a game's mutable fields to the server so rapid edits
 * (typing, clicking tiles, adjusting scores) collapse into a single PUT.
 *
 * - Only saves when the payload differs from what was last saved (or loaded),
 *   so simply opening a board never writes it.
 * - Saves go out one at a time, in order, so a slow older save can't land
 *   after a newer one and overwrite it.
 * - Failed saves are retried with backoff; a pending save is flushed when the
 *   page is hidden, closed or navigated away from instead of being dropped.
 */
export function useAutosaveGame(
  gameId: string,
  payload: GameUpdate,
  options: { enabled: boolean; delay?: number }
) {
  const { enabled, delay = 900 } = options;
  const serialized = JSON.stringify(payload);
  const url = `/api/games/${gameId}`;

  // What the server has (starts as what was loaded). Kept in state for
  // rendering and in a ref for the save queue, which runs outside render.
  const [savedSnapshot, setSavedSnapshot] = useState(serialized);
  const [hasSaved, setHasSaved] = useState(false);
  const [failure, setFailure] = useState<"error" | "failed" | null>(null);

  const savedRef = useRef(serialized);
  const latestRef = useRef(serialized);
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const attemptRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Lets a failed save schedule a retry without the save function naming itself.
  const retryRef = useRef<() => void>(() => {});

  useEffect(() => {
    latestRef.current = serialized;
  });

  // Sends the latest payload. Runs through a queue so only one save is in
  // flight at a time; each job reads the newest payload when it starts.
  const enqueue = useCallback(
    (opts: { force?: boolean; keepalive?: boolean } = {}): Promise<boolean> => {
      const job = queueRef.current.then(async () => {
        const body = latestRef.current;
        if (!opts.force && body === savedRef.current) return true;
        try {
          const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: opts.keepalive,
          });
          if (!res.ok) throw new Error(`Save failed with ${res.status}`);
          savedRef.current = body;
          attemptRef.current = 0;
          setSavedSnapshot(body);
          setHasSaved(true);
          setFailure(null);
          return true;
        } catch {
          const attempt = attemptRef.current++;
          if (attempt < RETRY_DELAYS_MS.length) {
            setFailure("error");
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            retryTimerRef.current = setTimeout(() => retryRef.current(), RETRY_DELAYS_MS[attempt]);
          } else {
            setFailure("failed");
          }
          return false;
        }
      });
      queueRef.current = job;
      return job;
    },
    [url]
  );

  useEffect(() => {
    retryRef.current = () => void enqueue();
  }, [enqueue]);

  // Debounced save whenever the payload drifts from what the server has.
  useEffect(() => {
    if (!enabled || serialized === savedRef.current) return;
    const timer = setTimeout(() => {
      attemptRef.current = 0;
      void enqueue();
    }, delay);
    return () => clearTimeout(timer);
  }, [serialized, enabled, delay, enqueue]);

  // Never drop a pending save: flush it when the tab is hidden or closed,
  // when the connection comes back, and when this screen unmounts (e.g. a
  // client-side navigation). keepalive lets the request outlive the page.
  useEffect(() => {
    if (!enabled) return;
    const flush = () => {
      if (latestRef.current !== savedRef.current) void enqueue({ keepalive: true });
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    const onOnline = () => {
      attemptRef.current = 0;
      flush();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      flush();
    };
  }, [enabled, enqueue]);

  /**
   * Saves right away, even if nothing changed (so a board that was only opened,
   * like a fresh demo copy, exists before someone navigates to it). Resolves
   * to whether the server now has the latest version.
   */
  const saveNow = useCallback(() => {
    attemptRef.current = 0;
    return enqueue({ force: true });
  }, [enqueue]);

  const dirty = serialized !== savedSnapshot;
  const status: SaveStatus = failure ?? (dirty ? "saving" : hasSaved ? "saved" : "idle");

  return { status, saveNow };
}
