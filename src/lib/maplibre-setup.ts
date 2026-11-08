import { getVersion, setWorkerUrl } from "maplibre-gl";

let configured = false;

/**
 * Point MapLibre at a CDN worker that matches the installed package version.
 * Next/Turbopack rewrites import.meta.url so the default relative worker 404s.
 */
export function ensureMaplibreWorker() {
  if (configured || typeof window === "undefined") return;
  configured = true;
  const version = getVersion();
  setWorkerUrl(
    `https://cdn.jsdelivr.net/npm/maplibre-gl@${version}/dist/maplibre-gl-worker.mjs`,
  );
}
