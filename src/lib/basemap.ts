/**
 * Basemap tiles.
 *
 * Two keyless providers failed here in the same silent way, so both are worth
 * recording: CARTO now serves an "API KEY REQUIRED" watermark, and Esri's Ocean
 * basemap serves "Map data not yet available" over Cozumel. Both answer HTTP 200
 * with a valid 256x256 PNG, so nothing errors and the map just looks wrong.
 * Check what a tile actually contains before trusting a provider.
 *
 * Esri World Imagery has real coverage here at every zoom the map uses.
 */
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";

export const SATELLITE = {
  url: `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
  attribution:
    'Imagery &copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
  maxZoom: 18,
} as const;

/** Place names drawn over the imagery. */
export const PLACE_LABELS = {
  url: `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`,
  maxZoom: 18,
} as const;
