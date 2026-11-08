export type MapLibreModule = typeof import("maplibre-gl");

const CDN_VERSION = "6.11.2";
const CDN_BASE = `https://cdn.jsdelivr.net/npm/maplibre-gl@${CDN_VERSION}/dist`;

let loading: Promise<MapLibreModule> | null = null;

/**
 * Load MapLibre from CDN (main + worker) so the bundler cannot break
 * the module-worker pairing. CSS still comes from the npm package import.
 */
export function loadMapLibre(): Promise<MapLibreModule> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("MapLibre is client-only"));
  }
  if (!loading) {
    // Native dynamic import — bypasses Turbopack/webpack rewriting.
    const href = `${CDN_BASE}/maplibre-gl.mjs`;
    loading = (
      new Function(`return import(${JSON.stringify(href)})`)() as Promise<MapLibreModule>
    ).then((mod) => {
      mod.setWorkerUrl(`${CDN_BASE}/maplibre-gl-worker.mjs`);
      return mod;
    });
  }
  return loading;
}
