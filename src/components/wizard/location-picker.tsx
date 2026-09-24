"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

export interface LocationValue {
  address: string;
  settlement: string;
  pin: { x: number; y: number };
  location?: { lat: number; lng: number };
}

interface LocationPickerProps {
  value?: LocationValue;
  onChange?: (value: LocationValue) => void;
}

const DEFAULT: LocationValue = {
  address: "Budaörs, Szabadság út",
  settlement: "Budaörs",
  pin: { x: 52, y: 48 },
  location: { lat: 47.4608, lng: 18.9583 },
};

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const t = useT();
  const [local, setLocal] = useState<LocationValue>(value ?? DEFAULT);
  const current = value ?? local;

  function update(next: LocationValue) {
    if (!value) setLocal(next);
    onChange?.(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={current.address}
          onChange={(e) => {
            const address = e.target.value;
            const settlement =
              address.split(",")[0]?.trim() || current.settlement;
            update({ ...current, address, settlement });
          }}
          placeholder={t("locationPicker.addressPlaceholder")}
          aria-label={t("locationPicker.addressAria")}
          className="h-11 flex-1"
        />
        <button
          type="button"
          className={cn(buttonVariants({ variant: "secondary" }), "h-11 gap-2")}
          onClick={() =>
            update({
              address: t("locationPicker.currentLocation"),
              settlement: "Budaörs",
              pin: { x: 48, y: 52 },
              location: { lat: 47.4608, lng: 18.9583 },
            })
          }
        >
          <Navigation className="size-4" />
          {t("locationPicker.useMyLocation")}
        </button>
      </div>
      <div
        className="relative h-64 overflow-hidden rounded-2xl border border-border bg-map sm:h-80"
        role="application"
        aria-label={t("locationPicker.mapAria")}
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
            update({
              ...current,
              pin: {
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              },
            });
          }}
        />
        <button
          type="button"
          className="absolute z-10 -translate-x-1/2 -translate-y-full text-primary drop-shadow-md"
          style={{ left: `${current.pin.x}%`, top: `${current.pin.y}%` }}
          aria-label={t("locationPicker.pinAria")}
          draggable
          onDragEnd={(e) => {
            const parent = (e.target as HTMLElement).parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            update({
              ...current,
              pin: {
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              },
            });
          }}
        >
          <MapPin className="size-10 fill-primary text-white" />
        </button>
      </div>
      <p className="text-sm text-muted-foreground">{t("locationPicker.hint")}</p>
    </div>
  );
}
