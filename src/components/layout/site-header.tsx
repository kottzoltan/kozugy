"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, List, Plus, Bell, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const nav = [
  { href: "/terkep", label: "Térkép" },
  { href: "/ugyek", label: "Ügyek" },
  { href: "/megoldodott", label: "Megoldódott" },
  { href: "/cikkek", label: "Cikkek" },
];

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="container-page flex h-14 items-center justify-between gap-4 md:h-16">
        <Link
          href="/"
          className="focus-ring shrink-0 rounded-md text-lg font-bold tracking-tight text-brand md:text-xl"
          aria-label="KÖZÜGY főoldal"
        >
          KÖZÜGY
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Fő navigáció">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "focus-ring rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden sm:inline-flex")}
            aria-label="Keresés"
          >
            <Search className="size-4" />
          </button>
          <Link
            href="/profil"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden gap-1.5 sm:inline-flex",
            )}
          >
            <User className="size-4" />
            Belépés
          </Link>
          <Link
            href="/uj-ugy"
            className={cn(buttonVariants({ size: "sm" }), "gap-1 font-semibold")}
          >
            <Plus className="size-4" />
            Új ügy
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const items = [
    { href: "/terkep", label: "Térkép", icon: Map },
    { href: "/korulottem", label: "Körülöttem", icon: List },
    { href: "/uj-ugy", label: "Új ügy", icon: Plus, primary: true },
    { href: "/ertesitesek", label: "Értesítések", icon: Bell },
    { href: "/profil", label: "Profil", icon: User },
  ] as const;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Mobil navigáció"
    >
      <ul className="grid h-16 grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          if ("primary" in item && item.primary) {
            return (
              <li key={item.href} className="relative flex items-center justify-center">
                <Link
                  href={item.href}
                  className="focus-ring -mt-5 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  aria-label={item.label}
                >
                  <Icon className="size-6" strokeWidth={2.5} />
                </Link>
              </li>
            );
          }
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "focus-ring flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
