import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/types";
import { getDictionary, interpolate } from "@/lib/i18n/translate";

function intlLocale(locale: Locale): string {
  return locale === "en" ? "en-GB" : "hu-HU";
}

export function formatNumber(n: number, locale: Locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(n);
}

export function formatDate(iso: string, locale: Locale = DEFAULT_LOCALE): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatShortDate(
  iso: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function formatDistance(
  meters: number,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const dict = getDictionary(locale);
  if (meters < 1000) {
    return interpolate(dict.common.metersAway, { m: Math.round(meters) });
  }
  const km = (meters / 1000).toFixed(1);
  return interpolate(dict.common.kmAway, {
    km: locale === "hu" ? km.replace(".", ",") : km,
  });
}
