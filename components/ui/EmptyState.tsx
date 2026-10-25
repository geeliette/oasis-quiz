import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed border-line px-8 py-14 text-center animate-float-in">
      {icon && <div className="text-ink">{icon}</div>}
      <h3 className="font-display text-2xl font-extrabold text-ink">{title}</h3>
      {description && (
        <p className="max-w-sm text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
