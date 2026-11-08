"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";
import { DEFAULT_MAP_CENTER, MAP_STYLE } from "@/lib/map-style";
import { loadMapLibre } from "@/lib/maplibre-setup";

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

const EMPTY: LocationValue = {
  address: "",
  settlement: "",
  pin: { x: 50, y: 50 },
  location: { ...DEFAULT_MAP_CENTER },
};

/** Sample text that was pre-filled in older builds — clear on focus. */
const SAMPLE_ADDRESSES = new Set([
  "Budaörs, Szabadság út",
  "Jelenlegi helyzeted (Budaörs)",
  "Your current location (Budaörs)",
  "Jelenlegi helyzeted",
  "Your current location",
]);

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const t = useT();
  const [local, setLocal] = useState<LocationValue>(value ?? EMPTY);
  const current = value ?? local;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const currentRef = useRef(current);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  function update(next: LocationValue) {
    if (!value) setLocal(next);
    onChange?.(next);
  }

  function setCoords(lat: number, lng: number, extras?: Partial<LocationValue>) {
    const next: LocationValue = {
      ...currentRef.current,
      ...extras,
      location: { lat, lng },
      pin: { x: 50, y: 50 },
    };
    update(next);
    markerRef.current?.setLngLat([lng, lat]);
    mapRef.current?.easeTo({
      center: [lng, lat],
      zoom: Math.max(mapRef.current.getZoom(), 14),
    });
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    (async () => {
      try {
        const maplibre = await loadMapLibre();
        if (cancelled || !mapContainerRef.current || mapRef.current) return;

        const start = currentRef.current.location ?? DEFAULT_MAP_CENTER;
        const map = new maplibre.Map({
          container: mapContainerRef.current,
          style: MAP_STYLE,
          center: [start.lng, start.lat],
          zoom: 14,
          attributionControl: { compact: true },
        });
        map.addControl(
          new maplibre.NavigationControl({ showCompass: false }),
          "top-right",
        );

        const marker = new maplibre.Marker({ color: "#0f766e", draggable: true })
          .setLngLat([start.lng, start.lat])
          .addTo(map);

        marker.on("dragend", () => {
          const { lng, lat } = marker.getLngLat();
          update({
            ...currentRef.current,
            location: { lat, lng },
            pin: { x: 50, y: 50 },
          });
        });

        map.on("click", (e) => {
          setCoords(e.lngLat.lat, e.lngLat.lng);
        });

        map.on("load", () => map.resize());

        ro = new ResizeObserver(() => map.resize());
        ro.observe(mapContainerRef.current);

        mapRef.current = map;
        markerRef.current = marker;
      } catch {
        // map stays empty — address field still works
      }
    })();

    return () => {
      cancelled = true;
      ro?.disconnect();
      markerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loc = current.location;
    if (!loc || !markerRef.current || !mapRef.current) return;
    const { lng, lat } = markerRef.current.getLngLat();
    if (Math.abs(lng - loc.lng) < 1e-7 && Math.abs(lat - loc.lat) < 1e-7) return;
    markerRef.current.setLngLat([loc.lng, loc.lat]);
    mapRef.current.setCenter([loc.lng, loc.lat]);
  }, [current.location]);

  async function geocodeAddress(query: string) {
    const q = query.trim();
    if (q.length < 3) return;
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");
      url.searchParams.set("countrycodes", "hu");
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return;
      const data = (await res.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;
      const hit = data[0];
      if (!hit) return;
      const lat = Number(hit.lat);
      const lng = Number(hit.lon);
      const settlement =
        hit.display_name.split(",")[0]?.trim() || currentRef.current.settlement;
      setCoords(lat, lng, { address: q, settlement });
    } catch {
      // ignore geocode failures — pin still works
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setCoords(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng, {
        address: t("locationPicker.currentLocation"),
        settlement: "Budaörs",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords(pos.coords.latitude, pos.coords.longitude, {
          address: "",
          settlement: currentRef.current.settlement || "",
        });
      },
      () => {
        setCoords(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng, {
          address: t("locationPicker.currentLocation"),
          settlement: "Budaörs",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
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
          onFocus={() => {
            if (SAMPLE_ADDRESSES.has(current.address)) {
              update({ ...current, address: "", settlement: "" });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void geocodeAddress(current.address);
            }
          }}
          onBlur={() => {
            if (current.address.trim().length >= 3) {
              void geocodeAddress(current.address);
            }
          }}
          placeholder={t("locationPicker.addressPlaceholder")}
          aria-label={t("locationPicker.addressAria")}
          className="h-11 flex-1"
        />
        <button
          type="button"
          className={cn(buttonVariants({ variant: "secondary" }), "h-11 gap-2")}
          onClick={useMyLocation}
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
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>
      <p className="text-sm text-muted-foreground">{t("locationPicker.hint")}</p>
    </div>
  );
}
