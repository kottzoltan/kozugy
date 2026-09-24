import type { TimelineEvent } from "@/lib/types";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICONS: Record<NonNullable<TimelineEvent["icon"]>, string> = {
  created: "📌",
  email: "✉️",
  response: "🏛️",
  status: "🟡",
};

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <ol className={cn("relative space-y-0 border-l border-border pl-6", className)}>
      {events.map((event, idx) => (
        <li key={event.id} className="relative pb-8 last:pb-0">
          <span
            className={cn(
              "absolute -left-[1.9rem] flex size-7 items-center justify-center rounded-full border border-border bg-card text-sm shadow-sm",
            )}
            aria-hidden
          >
            {event.icon ? ICONS[event.icon] : idx + 1}
          </span>
          <time className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {formatShortDate(event.date)}
          </time>
          <p className="mt-1 font-semibold">{event.title}</p>
          {event.description && (
            <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
