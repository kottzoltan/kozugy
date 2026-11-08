import { setWorkerUrl } from "maplibre-gl";

let configured = false;

/**
 * MapLibre resolves its worker relative to the bundled chunk URL, which 404s
 * under Next.js. Point it at the copies served from /public/maplibre.
 */
export function ensureMaplibreWorker() {
  if (configured || typeof window === "undefined") return;
  configured = true;
  setWorkerUrl(`${window.location.origin}/maplibre/maplibre-gl-worker.mjs`);
}
