import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Profil" };

export default function ProfilePage() {
  return (
    <div className="container-page mx-auto max-w-md py-10">
      <h1 className="text-3xl font-bold">Belépés</h1>
      <p className="mt-2 text-muted-foreground">
        Jelentkezz be, hogy támogathasd az ügyeket és kövesd a változásokat.
      </p>
      <div className="mt-8 flex flex-col gap-2">
        {["Facebook", "Google", "Apple", "Email"].map((p) => (
          <button
            key={p}
            type="button"
            className={cn(buttonVariants({ variant: "outline" }), "h-11")}
          >
            Folytatás {p} fiókkal
          </button>
        ))}
      </div>
    </div>
  );
}
