/** Carto light raster basemap — works without MapLibre vector workers. */
export const MAP_STYLE = {
  version: 8 as const,
  sources: {
    carto: {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap © CARTO",
    },
  },
  layers: [
    {
      id: "carto",
      type: "raster" as const,
      source: "carto",
    },
  ],
};

/** Default map center: Budaörs / west Budapest. */
export const DEFAULT_MAP_CENTER = {
  lat: 47.4608,
  lng: 18.9583,
} as const;
