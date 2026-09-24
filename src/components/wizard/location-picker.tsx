"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LocationPickerProps {
  onConfirm?: (address: string) => void;
}

export function LocationPicker({ onConfirm }: LocationPickerProps) {
  const [address, setAddress] = useState("Budaörs, Szabadság út");
  const [pin, setPin] = useState({ x: 52, y: 48 });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Írj be egy címet"
          aria-label="Cím keresése"
          className="h-11 flex-1"
        />
        <button
          type="button"
          className={cn(buttonVariants({ variant: "secondary" }), "h-11 gap-2")}
          onClick={() => {
            setAddress("Jelenlegi helyzeted (Budaörs)");
            setPin({ x: 48, y: 52 });
            onConfirm?.("Budaörs");
          }}
        >
          <Navigation className="size-4" />
          Helyzetem használata
        </button>
      </div>
      <div
        className="relative h-64 overflow-hidden rounded-2xl border border-border bg-map sm:h-80"
        role="application"
        aria-label="Helyszín választó térkép"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.88 0.03 200 / 0.5) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.88 0.03 200 / 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px",
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setPin({
              x: ((e.clientX - rect.left) / rect.width) * 100,
              y: ((e.clientY - rect.top) / rect.height) * 100,
            });
          }}
        />
        <button
          type="button"
          className="absolute z-10 -translate-x-1/2 -translate-y-full text-primary drop-shadow-md"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          aria-label="Húzható helyszínjelölő"
          draggable
          onDragEnd={(e) => {
            const parent = (e.target as HTMLElement).parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            setPin({
              x: ((e.clientX - rect.left) / rect.width) * 100,
              y: ((e.clientY - rect.top) / rect.height) * 100,
            });
          }}
        >
          <MapPin className="size-10 fill-primary text-white" />
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Húzd a jelölőt, vagy koppints a térképre a pontos helyhez.
      </p>
    </div>
  );
}
