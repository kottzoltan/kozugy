export const metadata = { title: "Értesítések" };

export default function NotificationsPage() {
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold">Értesítések</h1>
      <p className="mt-2 text-muted-foreground">
        Itt jelennek meg a követett ügyeid frissítései.
      </p>
      <div className="mt-8 rounded-2xl border border-dashed p-8 text-center">
        <p className="font-semibold">Még nincs értesítésed.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Kövesd az ügyeket, hogy értesülj a válaszokról.
        </p>
      </div>
    </div>
  );
}
