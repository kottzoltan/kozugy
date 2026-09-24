"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/types";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  function select(next: Locale) {
    setLocale(next);
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-background p-0.5 text-xs font-semibold",
        className,
      )}
      role="group"
      aria-label={t("lang.label")}
    >
      <button
        type="button"
        onClick={() => select("hu")}
        className={cn(
          "rounded-md px-2 py-1 transition-colors",
          locale === "hu"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={locale === "hu"}
        title={t("lang.switchToHu")}
      >
        HU
      </button>
      <button
        type="button"
        onClick={() => select("en")}
        className={cn(
          "rounded-md px-2 py-1 transition-colors",
          locale === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={locale === "en"}
        title={t("lang.switchTo")}
      >
        EN
      </button>
    </div>
  );
}
