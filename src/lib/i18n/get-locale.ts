import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/types";

export async function getLocale(): Promise<Locale> {
  try {
    const jar = await cookies();
    const value = jar.get(LOCALE_COOKIE)?.value;
    if (isLocale(value)) return value;
  } catch {
    /* cookies() unavailable outside request */
  }
  return DEFAULT_LOCALE;
}
