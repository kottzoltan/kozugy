"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

export default function NotFound() {
  const t = useT();
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-bold">{t("notFound.title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("notFound.subtitle")}</p>
      <Link href="/" className={cn(buttonVariants(), "mt-6")}>
        {t("notFound.home")}
      </Link>
    </div>
  );
}
