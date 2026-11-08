/**
 * Free raster basemap (no API key).
 * ESRI World Street Map — widely used for demos; attribution required.
 */
export const MAP_STYLE = {
  version: 8 as const,
  sources: {
    esri: {
      type: "raster" as const,
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "© Esri © OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "esri",
      type: "raster" as const,
      source: "esri",
    },
  ],
};

/** Default map center: Budaörs / west Budapest. */
export const DEFAULT_MAP_CENTER = {
  lat: 47.4608,
  lng: 18.9583,
} as const;
