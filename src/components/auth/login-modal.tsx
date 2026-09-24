"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { useT } from "@/components/i18n/locale-provider";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
  const t = useT();
  const {
    identityAvailable,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    loginDev,
  } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, name || undefined);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.loginFailed"));
    } finally {
      setPending(false);
    }
  }

  function handleDev() {
    loginDev();
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("auth.modalTitle")}</DialogTitle>
          <DialogDescription>{t("auth.modalDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {identityAvailable && (
            <button
              type="button"
              onClick={() => {
                loginWithGoogle();
              }}
              className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full")}
            >
              {t("auth.continueGoogle")}
            </button>
          )}

          {identityAvailable ? (
            <form onSubmit={handleEmailSubmit} className="mt-2 space-y-2">
              {mode === "signup" && (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("auth.name")}
                  aria-label={t("auth.name")}
                />
              )}
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.email")}
                aria-label={t("auth.email")}
              />
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.password")}
                aria-label={t("auth.password")}
              />
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className={cn(buttonVariants(), "h-11 w-full")}
              >
                {pending
                  ? t("auth.pending")
                  : mode === "login"
                    ? t("auth.loginEmail")
                    : t("auth.signup")}
              </button>
              <button
                type="button"
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
              </button>
            </form>
          ) : (
            <div className="space-y-2 rounded-xl border border-dashed border-border p-4">
              <p className="text-sm text-muted-foreground">
                {t("auth.identityLocal")}
              </p>
              <button
                type="button"
                onClick={handleDev}
                className={cn(buttonVariants(), "h-11 w-full")}
              >
                {t("auth.devLogin")}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
