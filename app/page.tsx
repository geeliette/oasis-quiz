import Link from "next/link";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Logo } from "@/components/ui/Logo";
import { RecentBoards } from "@/components/home/RecentBoards";

const FEATURES = [
  {
    title: "Design your board",
    description: "Categories, clues and point values in a tidy editor that saves as you type.",
    color: "bg-accent",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <path d="M14 17.5h7M17.5 14v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Host on one screen",
    description: "Put it on a TV or share your window on a call. Nobody installs anything.",
    color: "bg-sky",
    icon: (
      <>
        <rect x="2.5" y="4" width="19" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Keep score",
    description: "Award or take away points in one tap, for as many teams as you like.",
    color: "bg-teal",
    icon: <path d="M5 20V12M12 20V5M19 20v-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />,
  },
];

const MINI_CATEGORIES = [
  { name: "Animals", color: "bg-coral" },
  { name: "Space", color: "bg-teal" },
  { name: "Maths", color: "bg-lilac" },
];
const MINI_PLAYED = new Set(["0-1", "2-0"]);

// A tilted, decorative mini board for the hero.
function MiniBoard() {
  return (
    <div
      aria-hidden
      className="grid w-full max-w-[440px] rotate-[2.5deg] grid-cols-3 gap-2.5 rounded-[22px] border-2 border-ink bg-white p-[18px] shadow-[8px_8px_0_var(--color-ink)]"
    >
      {MINI_CATEGORIES.map((c) => (
        <span
          key={c.name}
          className={`${c.color} rounded-[10px] border-2 border-ink px-1 py-2 text-center text-xs font-bold uppercase tracking-wider`}
        >
          {c.name}
        </span>
      ))}
      {[100, 200, 300].flatMap((value, row) =>
        MINI_CATEGORIES.map((c, col) =>
          MINI_PLAYED.has(`${row}-${col}`) ? (
            <span key={`${row}-${col}`} className="h-16 rounded-[12px] border-2 border-dashed border-line" />
          ) : (
            <span
              key={`${row}-${col}`}
              className="flex h-16 items-center justify-center rounded-[12px] border-2 border-ink font-display text-2xl font-extrabold shadow-[3px_3px_0_var(--color-ink)]"
            >
              {value}
            </span>
          )
        )
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col px-6">
        <header className="flex items-center justify-between gap-4 py-7">
          <Link href="/" aria-label="Oasis Quiz home">
            <Logo />
          </Link>
          <Link href="/game/demo" className="px-1 py-3 font-bold text-ink hover:text-ink-soft">
            Try the demo →
          </Link>
        </header>

        <main className="flex flex-col">
          <section className="flex flex-wrap items-center gap-14 pb-16 pt-10 sm:pb-[72px] sm:pt-14">
            <div className="flex min-w-0 flex-[1_1_460px] flex-col items-start gap-6">
              <span className="-rotate-3 rounded-full border-2 border-ink bg-accent px-4 py-1.5 text-[15px] font-bold">
                Trivia night, sorted
              </span>
              <h1 className="font-display text-5xl font-extrabold leading-none tracking-[-0.03em] text-ink sm:text-[68px]">
                Build a trivia board your crew will{" "}
                <span className="relative inline-block">
                  love to play
                  <svg
                    aria-hidden
                    viewBox="0 0 300 16"
                    preserveAspectRatio="none"
                    fill="none"
                    className="absolute -bottom-2.5 left-0 h-4 w-full"
                  >
                    <path
                      d="M3 10c25-8 50 6 75 0s50-8 75 0 50 6 75 0 50-6 69-2"
                      stroke="var(--color-coral)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="mt-2 max-w-[480px] text-lg leading-relaxed text-ink-soft sm:text-[19px]">
                Make a Jeopardy-style board in minutes, share one link, and host it on any screen.
                Team scores are built in. No accounts, no buzzers.
              </p>
              <div className="flex flex-wrap gap-3.5 pt-2">
                <Link href="/new" className={buttonClasses("primary", "lg")}>
                  Create a new game
                </Link>
                <Link href="/game/demo" className={buttonClasses("outline", "lg")}>
                  Play the demo
                </Link>
              </div>
            </div>

            <div className="flex min-w-0 flex-[1_1_380px] justify-center">
              <MiniBoard />
            </div>
          </section>

          <RecentBoards />

          <section className="grid gap-5 pt-[88px] sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-3 rounded-[20px] border-2 border-ink bg-white p-7"
              >
                <span
                  className={`${f.color} inline-flex h-12 w-12 items-center justify-center rounded-[14px] border-2 border-ink text-ink`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    {f.icon}
                  </svg>
                </span>
                <h2 className="mt-1 font-display text-[22px] font-extrabold text-ink">{f.title}</h2>
                <p className="leading-relaxed text-ink-soft">{f.description}</p>
              </div>
            ))}
          </section>

          <section className="mt-[88px] flex flex-wrap items-center justify-between gap-6 rounded-[24px] border-2 border-ink bg-accent p-8 sm:p-10">
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5">
              <h2 className="font-display text-[28px] font-extrabold tracking-[-0.02em] text-ink sm:text-[34px]">
                Share a link, skip the sign-up.
              </h2>
              <p className="text-[17px] leading-relaxed text-ink">
                Every board gets its own link, like{" "}
                <code className="rounded-lg border-2 border-ink bg-white px-2 py-px text-[15px]">
                  /game/abc123xy
                </code>
                . Anyone with it can open the board and play.
              </p>
            </div>
            <Link href="/new" className={buttonClasses("primary", "lg")}>
              Get started
            </Link>
          </section>
        </main>

        <footer className="pb-10 pt-14 text-center text-[15px] text-ink-faint">
          Made for game nights, classrooms and anyone who loves a good “ooh, I know this one!”
        </footer>
      </div>
    </div>
  );
}
