"use client";

import { useState } from "react";
import type { Comment } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/locale-provider";

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments: initial }: CommentListProps) {
  const { locale, t } = useLocale();
  const [comments, setComments] = useState(initial);
  const [text, setText] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        author: t("common.you"),
        date: new Date().toISOString(),
        text: text.trim(),
      },
    ]);
    setText("");
  }

  return (
    <section>
      <h2 className="text-xl font-semibold">{t("comments.title")}</h2>
      <form onSubmit={submit} className="mt-4 space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("comments.placeholder")}
          rows={3}
          aria-label={t("comments.aria")}
        />
        <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>
          {t("comments.submit")}
        </button>
      </form>
      <ul className="mt-6 space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">{c.author}</p>
              <time className="text-xs text-muted-foreground" dateTime={c.date}>
                {formatDate(c.date, locale)}
              </time>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{c.text}</p>
            <div className="mt-3 flex gap-3 text-xs font-medium text-muted-foreground">
              <button type="button" className="hover:text-foreground">
                {t("comments.reply")}
              </button>
              <button type="button" className="hover:text-foreground">
                {t("comments.report")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
