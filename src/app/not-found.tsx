import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-bold">Nem találjuk ezt az oldalt.</h1>
      <p className="mt-2 text-muted-foreground">
        Lehet, hogy az ügy már nincs elérhető, vagy a link hibás.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-6")}>
        Vissza a főoldalra
      </Link>
    </div>
  );
}
