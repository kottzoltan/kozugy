"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Map as MapLibreMap,
  NavigationControl,
  LngLatBounds,
  type GeoJSONSource,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";
import type { Issue } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { STATUS_DOT, STATUS_EMOJI, getStatusLabel } from "@/lib/status";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useLocale } from "@/components/i18n/locale-provider";
import { DEFAULT_MAP_CENTER, MAP_STYLE_URL } from "@/lib/map-style";

const BUDAPEST: [number, number] = [DEFAULT_MAP_CENTER.lng, DEFAULT_MAP_CENTER.lat];

interface IssueMapProps {
  issues: Issue[];
  className?: string;
  heightClass?: string;
  interactive?: boolean;
  selectedSlug?: string;
  mini?: boolean;
  centerLabel?: string;
}

function issuesToGeoJSON(issues: Issue[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: issues.map((issue) => ({
      type: "Feature",
      properties: {
        id: issue.id,
        slug: issue.slug,
        title: issue.title,
        status: issue.status,
        supporters: issue.supporters,
        settlement: issue.settlement,
      },
      geometry: {
        type: "Point",
        coordinates: [issue.location.lng, issue.location.lat],
      },
    })),
  };
}

/** Real MapLibre map with clustering — OpenFreeMap tiles (no API key). */
export function IssueMap({
  issues,
  className,
  heightClass = "h-[320px] md:h-full md:min-h-[420px]",
  interactive = true,
  selectedSlug,
  mini = false,
  centerLabel = "Budapest és környéke",
}: IssueMapProps) {
  const { locale, t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [active, setActive] = useState<string | null>(selectedSlug ?? null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const activeIssue = issues.find((i) => i.slug === active);

  const geojson = useMemo(() => issuesToGeoJSON(issues), [issues]);

  const fitToIssues = useCallback((map: MapLibreMap, data: GeoJSON.FeatureCollection) => {
    if (!data.features.length) {
      map.setCenter(BUDAPEST);
      map.setZoom(mini ? 13 : 10);
      return;
    }
    if (data.features.length === 1) {
      const [lng, lat] = (data.features[0].geometry as GeoJSON.Point).coordinates;
      map.setCenter([lng, lat]);
      map.setZoom(mini ? 14 : 12);
      return;
    }
    const bounds = new LngLatBounds();
    for (const f of data.features) {
      bounds.extend((f.geometry as GeoJSON.Point).coordinates as [number, number]);
    }
    map.fitBounds(bounds, { padding: mini ? 40 : 60, maxZoom: 13, duration: 0 });
  }, [mini]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: BUDAPEST,
      zoom: 10,
      attributionControl: { compact: true },
      interactive: interactive || mini,
    });

    if (!mini) {
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    }

    const onLoad = () => {
      map.resize();
      map.addSource("issues", {
        type: "geojson",
        data: geojson,
        cluster: !mini,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "issues",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#0f766e",
          "circle-radius": ["step", ["get", "point_count"], 16, 5, 20, 15, 26],
          "circle-opacity": 0.9,
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "issues",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: "unclustered",
        type: "circle",
        source: "issues",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "match",
            ["get", "status"],
            "megoldott",
            "#10b981",
            "vizsgalat",
            "#fbbf24",
            "folyamatban",
            "#f97316",
            "ertesitve",
            "#3b82f6",
            "elutasitott",
            "#94a3b8",
            "#0ea5e9",
          ],
          "circle-radius": mini ? 7 : 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      fitToIssues(map, geojson);
      setReady(true);
      setLoadError(false);
    };

    map.on("load", onLoad);
    map.on("error", () => setLoadError(true));

    map.on("click", "clusters", (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
      const clusterId = features[0]?.properties?.cluster_id;
      const source = map.getSource("issues") as GeoJSONSource;
      if (clusterId == null) return;
      source.getClusterExpansionZoom(clusterId).then((zoom) => {
        const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
        map.easeTo({ center: coords, zoom });
      });
    });

    map.on("click", "unclustered", (e) => {
      if (!interactive) return;
      const slug = e.features?.[0]?.properties?.slug as string | undefined;
      if (slug) setActive(slug);
    });

    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", "unclustered", () => {
      map.getCanvas().style.cursor = interactive ? "pointer" : "";
    });
    map.on("mouseleave", "unclustered", () => {
      map.getCanvas().style.cursor = "";
    });

    const ro = new ResizeObserver(() => {
      map.resize();
    });
    ro.observe(containerRef.current);

    mapRef.current = map;
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // init once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const source = map.getSource("issues") as GeoJSONSource | undefined;
    if (source) {
      source.setData(geojson);
      if (!active) fitToIssues(map, geojson);
    }
  }, [geojson, ready, fitToIssues, active]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-map",
        heightClass,
        className,
      )}
    >
      {!ready && !loadError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-map">
          <p className="text-sm text-muted-foreground">Térkép betöltése…</p>
        </div>
      )}
      {loadError && !ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-map p-4 text-center">
          <p className="text-sm text-muted-foreground">
            A térkép most nem elérhető. Próbáld újra később.
          </p>
        </div>
      )}
      {/* h-full w-full — not absolute: maplibre-gl.css sets .maplibregl-map { position: relative } */}
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label={`Térkép: ${centerLabel}`}
      />

      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg bg-background/90 px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
        {centerLabel}
      </div>

      {interactive && activeIssue && !mini && (
        <div className="absolute bottom-3 left-3 right-3 z-20 rounded-xl border border-border bg-card p-3 shadow-lg sm:left-auto sm:right-3 sm:w-72">
          <button
            type="button"
            className="absolute right-2 top-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setActive(null)}
            aria-label={t("map.closeCard")}
          >
            ✕
          </button>
          <p className="pr-6 font-semibold leading-snug">{activeIssue.title}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {activeIssue.settlement}
          </p>
          <p className="mt-1 text-sm font-medium">
            {t("common.peopleAffected", {
              count: formatNumber(activeIssue.supporters, locale),
            })}
          </p>
          <p className="mt-1 text-sm">
            {STATUS_EMOJI[activeIssue.status]}{" "}
            {getStatusLabel(activeIssue.status, locale)}
          </p>
          <Link
            href={`/ugy/${activeIssue.slug}`}
            className={cn(buttonVariants({ size: "sm" }), "mt-3 w-full")}
          >
            {t("map.viewIssue")}
          </Link>
        </div>
      )}

      {!interactive && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center p-3">
          <Link
            href="/terkep"
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shadow-sm")}
          >
            {t("map.openLarge")}
          </Link>
        </div>
      )}

      <span className="sr-only">{Object.values(STATUS_DOT).join(" ")}</span>
    </div>
  );
}

export function MapIssueMarker() {
  return null;
}
