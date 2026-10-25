import clsx from "clsx";

export type Variant = "primary" | "accent" | "ghost" | "outline" | "danger" | "success";
export type Size = "sm" | "md" | "lg";

// Pressable things get an ink outline and a hard offset shadow that "presses
// in" on click.
const pressable =
  "border-2 border-ink hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";

const variantClasses: Record<Variant, string> = {
  primary: clsx(pressable, "bg-ink text-white shadow-[4px_4px_0_var(--color-coral)]"),
  accent: clsx(pressable, "bg-accent text-ink shadow-[var(--shadow-hard)]"),
  outline: clsx(pressable, "bg-white text-ink shadow-[var(--shadow-hard)]"),
  ghost: "bg-transparent text-ink-soft hover:bg-surface-soft hover:text-ink",
  danger: clsx(pressable, "bg-danger text-white shadow-[var(--shadow-hard)]"),
  success: clsx(pressable, "bg-success text-ink shadow-[var(--shadow-hard)]"),
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm min-h-10 px-3.5 rounded-[10px] gap-1.5",
  md: "text-[0.95rem] min-h-11 px-4 rounded-[12px] gap-2",
  lg: "text-[1.05rem] min-h-[52px] px-6 rounded-[14px] gap-2.5",
};

// Exported so a <Link> can look like a button without nesting a <button> in it.
export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return clsx(
    "inline-flex items-center justify-center font-sans font-bold",
    "transition-all duration-150 ease-out",
    "disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}
