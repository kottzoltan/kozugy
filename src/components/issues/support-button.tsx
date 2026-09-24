"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/login-modal";
import { useAuth } from "@/components/auth/auth-provider";
import { useLocale } from "@/components/i18n/locale-provider";
import { formatNumber } from "@/lib/format";

interface SupportButtonProps {
  slug: string;
  initialCount: number;
  initiallySupported?: boolean;
  size?: "default" | "lg" | "sticky";
  className?: string;
}

export function SupportButton({
  slug,
  initialCount,
  initiallySupported = false,
  size = "default",
  className,
}: SupportButtonProps) {
  const { user } = useAuth();
  const { locale, t } = useLocale();
  const [count, setCount] = useState(initialCount);
  const [supported, setSupported] = useState(initiallySupported);
  const [loginOpen, setLoginOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function persistSupport() {
    setError(null);
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (user?.isDev) {
      headers["x-kozugy-dev-user"] = JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    }

    const res = await fetch(`/api/issues/${slug}/support`, {
      method: "POST",
      headers,
    });

    if (res.status === 401) {
      setLoginOpen(true);
      return;
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? t("support.saveError"));
      return;
    }

    const data = (await res.json()) as {
      supporters: number;
      alreadySupported: boolean;
    };
    setCount(data.supporters);
    setSupported(true);
  }

  function handleClick() {
    if (supported) return;
    if (!user) {
      setLoginOpen(true);
      return;
    }
    startTransition(() => {
      void persistSupport();
    });
  }

  function handleLoginSuccess() {
    setLoginOpen(false);
    startTransition(() => {
      void persistSupport();
    });
  }

  const sizeClass =
    size === "lg"
      ? "h-12 w-full text-base font-bold tracking-wide"
      : size === "sticky"
        ? "h-11 flex-1 text-sm font-bold"
        : "h-10 px-4 text-sm font-semibold";

  return (
    <div className={cn(size === "sticky" ? "flex-1" : undefined)}>
      <button
        type="button"
        disabled={pending || supported}
        onClick={handleClick}
        className={cn(
          buttonVariants({ variant: supported ? "secondary" : "default" }),
          sizeClass,
          className,
          size === "sticky" && "w-full",
        )}
        aria-pressed={supported}
      >
        {supported ? t("support.supported") : t("support.cta")}
        {size !== "sticky" && (
          <span className="ml-1 opacity-80">
            · {formatNumber(count, locale)}
          </span>
        )}
      </button>
      {error && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
