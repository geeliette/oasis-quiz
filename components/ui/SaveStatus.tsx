import clsx from "clsx";
import { Spinner } from "./Spinner";
import type { SaveStatus as Status } from "@/hooks/useAutosaveGame";

export function SaveStatusIndicator({ status }: { status: Status }) {
  const config: Record<Status, { label: string; className: string }> = {
    idle: { label: "All changes saved", className: "text-ink-faint" },
    saving: { label: "Saving…", className: "text-primary" },
    saved: { label: "Saved", className: "text-success-dark" },
    error: { label: "Couldn't save — retrying…", className: "text-danger-dark" },
    failed: { label: "Couldn't save — check your connection", className: "text-danger-dark" },
  };
  const { label, className } = config[status];

  return (
    <div className={clsx("flex items-center gap-1.5 text-xs font-semibold", className)}>
      {status === "saving" ? (
        <Spinner size={13} />
      ) : (
        <span
          className={clsx(
            "h-2 w-2 rounded-full",
            status === "error" || status === "failed"
              ? "bg-danger"
              : status === "saved"
                ? "bg-success"
                : "bg-ink-faint"
          )}
        />
      )}
      {label}
    </div>
  );
}
