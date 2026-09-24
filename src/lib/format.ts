export function formatNumber(n: number): string {
  return new Intl.NumberFormat("hu-HU").format(n);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} méterre`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km-re`;
}
