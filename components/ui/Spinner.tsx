import clsx from "clsx";

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      className={clsx("animate-spin text-current", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-primary">
      <Spinner size={36} />
      <p className="font-display text-sm font-semibold text-ink-soft">{label}</p>
    </div>
  );
}
