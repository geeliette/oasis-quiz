import clsx from "clsx";

// A sun sinking behind two waves: the oasis. `ground` must match whatever the
// mark sits on, since it paints over the bottom of the sun.
export function LogoMark({
  size = 32,
  ground = "var(--background)",
  className,
}: {
  size?: number;
  ground?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={clsx("shrink-0", className)}
    >
      <circle cx="16" cy="15" r="8" fill="var(--color-accent)" stroke="var(--color-ink)" strokeWidth="2" />
      <path d="M2 21c3.5 0 3.5-2.5 7-2.5s3.5 2.5 7 2.5 3.5-2.5 7-2.5 3.5 2.5 7 2.5V32H2Z" fill={ground} />
      <path
        d="M2 21c3.5 0 3.5-2.5 7-2.5s3.5 2.5 7 2.5 3.5-2.5 7-2.5 3.5 2.5 7 2.5"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 26.5c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-2xl font-extrabold tracking-tight text-ink">
        oasis quiz
      </span>
    </span>
  );
}
