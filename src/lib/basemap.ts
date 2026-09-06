/**
 * Basemap tiles.
 *
 * CARTO's public endpoint started returning an "API KEY REQUIRED" placeholder
 * tile — still HTTP 200, so it fails silently and just renders as a watermark.
 * Esri's Ocean basemap needs no key and shows bathymetry, which is the relevant
 * context for dive sites and shark habitat.
 */
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";

export const OCEAN_BASE = {
  url: `${ESRI}/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}`,
  attribution:
    'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; ' +
    "Sources: GEBCO, NOAA, National Geographic, Garmin, HERE, and other contributors",
  maxZoom: 16,
} as const;

/** Place and depth labels, drawn over the base. */
export const OCEAN_LABELS = {
  url: `${ESRI}/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}`,
  maxZoom: 16,
} as const;
