/** Simple slugify for HU/EN titles. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

export function newIssueId(): string {
  return `iss-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newSuggestionId(): string {
  return `sug-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
