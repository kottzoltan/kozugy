"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/login-modal";
import { formatNumber } from "@/lib/format";

interface SupportButtonProps {
  initialCount: number;
  size?: "default" | "lg" | "sticky";
  className?: string;
  loggedIn?: boolean;
}

export function SupportButton({
  initialCount,
  size = "default",
  className,
  loggedIn = false,
}: SupportButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [supported, setSupported] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!loggedIn && !supported) {
      setLoginOpen(true);
      return;
    }
    startTransition(() => {
      if (supported) {
        setSupported(false);
        setCount((c) => c - 1);
      } else {
        setSupported(true);
        setCount((c) => c + 1);
      }
    });
  }

  function handleLoginSuccess() {
    setLoginOpen(false);
    startTransition(() => {
      setSupported(true);
      setCount((c) => c + 1);
    });
  }

  const sizeClass =
    size === "lg"
      ? "h-12 w-full text-base font-bold tracking-wide"
      : size === "sticky"
        ? "h-11 flex-1 text-sm font-bold"
        : "h-10 px-4 text-sm font-semibold";

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        className={cn(
          buttonVariants({ variant: supported ? "secondary" : "default" }),
          sizeClass,
          className,
        )}
        aria-pressed={supported}
      >
        {supported ? "Érintett vagy" : "ENGEM IS ÉRINT"}
        {size !== "sticky" && (
          <span className="ml-1 opacity-80">· {formatNumber(count)}</span>
        )}
      </button>
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}
