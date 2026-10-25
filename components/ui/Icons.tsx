// Small stroke icons used in empty and error states, in place of emoji.

export function LostIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="21" cy="21" r="13" fill="var(--color-accent)" stroke="currentColor" strokeWidth="3" />
      <path d="M31 31l10 10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M17 17.5a4 4 0 1 1 5.5 3.7c-1 .4-1.5 1.2-1.5 2.3v.5M21 28v.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function AlertIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M21.4 7.5a3 3 0 0 1 5.2 0l16 27.5A3 3 0 0 1 40 39.5H8a3 3 0 0 1-2.6-4.5l16-27.5Z"
        fill="var(--color-coral)"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M24 18v9M24 32.5v.1" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyBoardIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="5" y="5" width="16" height="16" rx="4" fill="var(--color-teal)" stroke="currentColor" strokeWidth="3" />
      <rect x="27" y="5" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" />
      <rect x="5" y="27" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" />
      <path d="M35 29v12M29 35h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
