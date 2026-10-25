import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RecentBoards } from "@/components/home/RecentBoards";

const FEATURES = [
  {
    title: "Design your board",
    description:
      "Add categories, clues, and point values in a clean editor. Autosaves as you type.",
  },
  {
    title: "Host on one screen",
    description:
      "Project the play screen or share your window on a call — players jump in without installing anything.",
  },
  {
    title: "Track team scores",
    description:
      "Award or deduct points with one click. Scores update live with a satisfying pop.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏝️</span>
          <span className="font-display text-xl font-extrabold text-ink">
            Oasis Quiz
          </span>
        </div>
        <Link href="/game/demo">
          <Button variant="ghost" size="sm">
            Try the demo →
          </Button>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 pb-24 pt-10 text-center">
        <div className="rounded-full bg-primary-light/40 px-4 py-1.5 text-sm font-bold text-primary-dark">
          A friendlier way to build trivia night
        </div>

        <h1 className="mt-6 max-w-3xl font-display text-5xl font-extrabold leading-[1.1] text-ink sm:text-6xl">
          Build custom trivia boards your whole crew will{" "}
          <span className="bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">
            love to play
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-lg text-ink-soft">
          Oasis Quiz is a colorful, Jeopardy-style board builder with built-in
          team scorekeeping, ready to share with a single link.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/new">
            <Button size="lg">Create a new game</Button>
          </Link>
          <Link href="/game/demo">
            <Button size="lg" variant="outline">
              Play the demo board
            </Button>
          </Link>
        </div>

        <RecentBoards />

        <div className="mt-24 grid w-full gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-white p-6 text-center shadow-[var(--shadow-soft)]"
            >
              <h3 className="font-display text-lg font-bold text-ink">
                {f.title}
              </h3>
              <p className="text-sm text-ink-soft">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 w-full rounded-3xl border-2 border-border bg-gradient-to-br from-primary-light/30 to-coral/10 p-8 sm:p-10">
          <div className="mx-auto grid max-w-3xl gap-6 text-left sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">
                Share a link, skip the sign-up.
              </h2>
              <p className="mt-2 text-ink-soft">
                Every game you create gets its own shareable URL like{" "}
                <code className="rounded bg-white px-1.5 py-0.5 text-sm text-primary-dark">
                  /game/abc123xy
                </code>
                . Anyone with the link can open it and play — even after you
                close the tab.
              </p>
            </div>
            <Link href="/new" className="sm:justify-self-end">
              <Button size="lg" variant="accent">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-ink-faint">
        Built for game nights, classrooms, and anyone who loves a good buzzer moment.
      </footer>
    </div>
  );
}
