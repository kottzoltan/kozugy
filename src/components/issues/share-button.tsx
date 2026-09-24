"use client";

import { useState } from "react";
import { Link2, MessageCircle, Share2, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareButtonProps {
  title: string;
  url?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "lg" | "sticky" | "icon";
  className?: string;
  label?: string;
}

export function ShareButton({
  title,
  url,
  variant = "outline",
  size = "default",
  className,
  label = "MEGOSZTOM",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [thanks, setThanks] = useState(false);
  const shareUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "https://kozosugyunk.hu");

  async function nativeOrOpen() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl, text: title });
        setThanks(true);
        setTimeout(() => setThanks(false), 3000);
        return;
      } catch {
        /* user cancelled */
      }
    }
    setOpen(true);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setThanks(true);
    setTimeout(() => {
      setCopied(false);
      setThanks(false);
    }, 2500);
  }

  const sizeClass =
    size === "lg"
      ? "h-12 w-full text-base font-semibold"
      : size === "sticky"
        ? "h-11 flex-1 text-sm font-semibold"
        : size === "icon"
          ? ""
          : "h-10 px-4 text-sm font-semibold";

  const channels = [
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: ExternalLink,
    },
    {
      name: "Messenger",
      href: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}`,
      icon: MessageCircle,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
      icon: MessageCircle,
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      icon: Share2,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      icon: ExternalLink,
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={nativeOrOpen}
        className={cn(buttonVariants({ variant, size: size === "icon" ? "icon" : "default" }), sizeClass, className)}
        aria-label={label}
      >
        {size === "icon" ? <Share2 className="size-4" /> : label}
      </button>

      {thanks && (
        <p className="mt-2 text-center text-sm text-muted-foreground" role="status">
          Köszönjük, hogy segítesz láthatóvá tenni az ügyet.
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Megosztás</DialogTitle>
            <DialogDescription>
              Segíts, hogy mások is lássák ezt az ügyet.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {channels.map((ch) => (
              <a
                key={ch.name}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 justify-start gap-2",
                )}
                onClick={() => {
                  setThanks(true);
                  setTimeout(() => setThanks(false), 3000);
                }}
              >
                <ch.icon className="size-4" />
                {ch.name}
              </a>
            ))}
            <button
              type="button"
              onClick={copyLink}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "col-span-2 h-10 gap-2 sm:col-span-3",
              )}
            >
              {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
              {copied ? "Másolva" : "Link másolása"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
