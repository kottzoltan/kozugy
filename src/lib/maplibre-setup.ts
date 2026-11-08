import { getVersion, setWorkerUrl } from "maplibre-gl";

let configured = false;

/**
 * MapLibre resolves its worker relative to the bundled chunk URL, which 404s
 * under Next.js. Use the matching published worker (cross-origin → MapLibre
 * wraps it in a blob module import, which is the reliable path).
 */
export function ensureMaplibreWorker() {
  if (configured || typeof window === "undefined") return;
  configured = true;
  const version = getVersion();
  setWorkerUrl(
    `https://cdn.jsdelivr.net/npm/maplibre-gl@${version}/dist/maplibre-gl-worker.mjs`,
  );
}
