import { cn } from "@/lib/utils";
import type { IssueStatus } from "@/lib/types";
import { STATUS_DOT, STATUS_EMOJI, STATUS_LABEL } from "@/lib/status";

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
  showEmoji?: boolean;
}

export function StatusBadge({
  status,
  className,
  showEmoji = true,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground",
        className,
      )}
    >
      {showEmoji ? (
        <span aria-hidden>{STATUS_EMOJI[status]}</span>
      ) : (
        <span
          className={cn("size-2 rounded-full", STATUS_DOT[status])}
          aria-hidden
        />
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}
