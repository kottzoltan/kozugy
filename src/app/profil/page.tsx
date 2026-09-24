"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { LoginModal } from "@/components/auth/login-modal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

export default function ProfilePage() {
  const t = useT();
  const { user, loading, logout, identityAvailable } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  if (loading) {
    return (
      <div className="container-page mx-auto max-w-md py-10">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="container-page mx-auto max-w-md py-10">
        <h1 className="text-3xl font-bold">{t("auth.profileTitle")}</h1>
        <p className="mt-4 font-medium">
          {user.name ?? t("auth.userFallback")}
        </p>
        <p className="text-muted-foreground">{user.email}</p>
        {user.isDev && (
          <p className="mt-2 text-sm text-amber-700">{t("auth.devSession")}</p>
        )}
        <button
          type="button"
          onClick={() => void logout()}
          className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
        >
          {t("nav.logout")}
        </button>
      </div>
    );
  }

  return (
    <div className="container-page mx-auto max-w-md py-10">
      <h1 className="text-3xl font-bold">{t("auth.loginTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("auth.loginSubtitle")}</p>
      {!identityAvailable && (
        <p className="mt-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          {t("auth.identityHint")}
        </p>
      )}
      <button
        type="button"
        onClick={() => setLoginOpen(true)}
        className={cn(buttonVariants(), "mt-6 h-11 w-full")}
      >
        {t("nav.login")}
      </button>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
