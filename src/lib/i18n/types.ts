export type Locale = "hu" | "en";

export const LOCALES: Locale[] = ["hu", "en"];
export const DEFAULT_LOCALE: Locale = "hu";
export const LOCALE_COOKIE = "kozugy_locale";

export function isLocale(value: unknown): value is Locale {
  return value === "hu" || value === "en";
}
