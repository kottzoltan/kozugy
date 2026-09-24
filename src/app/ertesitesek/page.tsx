import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/translate";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return { title: t.notifications.title };
}

export default async function NotificationsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold">{t.notifications.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.notifications.subtitle}</p>
      <div className="mt-8 rounded-2xl border border-dashed p-8 text-center">
        <p className="font-semibold">{t.notifications.emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.notifications.emptySubtitle}
        </p>
      </div>
    </div>
  );
}
