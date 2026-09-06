"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import {
  Sighting,
  SPECIES_LABELS,
  SPECIES_SCIENTIFIC,
  BEHAVIOR_LABELS,
  Behavior,
} from "@/types";
import { MapPin, User, Ruler, Gauge, ExternalLink } from "lucide-react";

/** Sightings are georeferenced to official dive sites, so many share a point. */
interface SiteGroup {
  key: string;
  latitude: number;
  longitude: number;
  siteName: string | null;
  sightings: Sighting[];
}

function groupBySite(sightings: Sighting[]): SiteGroup[] {
  const groups = new Map<string, SiteGroup>();
  for (const s of sightings) {
    // Round to ~1 m so floating-point noise does not split one site in two.
    const key = `${s.latitude.toFixed(5)},${s.longitude.toFixed(5)}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        latitude: s.latitude,
        longitude: s.longitude,
        siteName: s.siteName,
        sightings: [],
      };
      groups.set(key, group);
    }
    group.sightings.push(s);
    if (!group.siteName && s.siteName) group.siteName = s.siteName;
  }

  for (const group of groups.values()) {
    group.sightings.sort((a, b) => (b.observedAt ?? "").localeCompare(a.observedAt ?? ""));
  }
  return [...groups.values()];
}

/** Marker size and colour encode how much was seen at a site. */
function siteIcon(total: number): L.DivIcon {
  const size = total >= 50 ? 46 : total >= 20 ? 40 : total >= 5 ? 34 : 28;
  const background =
    total >= 50 ? "#065f46" : total >= 20 ? "#047857" : total >= 5 ? "#059669" : "#10b981";

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;background:${background};
      border:2px solid rgba(255,255,255,.9);border-radius:9999px;
      box-shadow:0 2px 6px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font:600 ${size >= 40 ? 13 : 11}px/1 ui-sans-serif,system-ui,sans-serif;
    ">${total}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/**
 * Field records point at Drive folders and social posts as often as at image
 * files, so only render an <img> when the URL actually is one.
 */
function isDirectImage(url: string): boolean {
  if (url.startsWith("ipfs://")) return true;
  try {
    const { pathname } = new URL(url);
    return /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i.test(pathname);
  } catch {
    return false;
  }
}

function mediaHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "link";
  }
}

function formatDate(observedAt: string | null): string {
  if (!observedAt) return "Date unknown";
  return new Date(observedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Keeps the viewport on the data instead of a hardcoded region. */
function FitToSightings({ groups }: { groups: SiteGroup[] }) {
  const map = useMap();
  useEffect(() => {
    if (groups.length === 0) return;
    const bounds = L.latLngBounds(groups.map((g) => [g.latitude, g.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
  }, [groups, map]);
  return null;
}

function SightingRow({ sighting }: { sighting: Sighting }) {
  const scientific = SPECIES_SCIENTIFIC[sighting.species];
  return (
    <li className="border-b border-gray-100 last:border-0 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-gray-800">
          {SPECIES_LABELS[sighting.species]}
          {sighting.count > 1 && (
            <span className="ml-1 text-emerald-700">&times;{sighting.count}</span>
          )}
        </span>
        <span className="text-[11px] text-gray-400 whitespace-nowrap">
          {formatDate(sighting.observedAt)}
        </span>
      </div>

      {scientific && <div className="text-[11px] italic text-gray-400">{scientific}</div>}

      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
        {sighting.behavior !== Behavior.UNKNOWN && (
          <span>{BEHAVIOR_LABELS[sighting.behavior]}</span>
        )}
        {sighting.sizeClass && (
          <span className="flex items-center gap-1">
            <Ruler size={10} /> {sighting.sizeClass}
          </span>
        )}
        {sighting.depthFt ? (
          <span className="flex items-center gap-1">
            <Gauge size={10} /> {sighting.depthFt} ft
          </span>
        ) : null}
      </div>

      {sighting.mediaUrl &&
        (isDirectImage(sighting.mediaUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sighting.mediaUrl}
            alt={SPECIES_LABELS[sighting.species]}
            className="mt-1.5 w-full rounded"
            style={{ height: 120, objectFit: "cover" }}
          />
        ) : (
          <a
            href={sighting.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-600"
          >
            <ExternalLink size={10} />
            Photos on {mediaHost(sighting.mediaUrl)}
          </a>
        ))}

      {sighting.comment && (
        <p className="mt-1 text-[11px] text-gray-600 italic">{sighting.comment}</p>
      )}

      <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-300 font-mono">
        <User size={9} />
        <span className="truncate">{sighting.reporter}</span>
      </div>
    </li>
  );
}

export default function MapComponent({ sightings }: { sightings: Sighting[] }) {
  const groups = useMemo(() => groupBySite(sightings), [sightings]);

  return (
    <MapContainer
      center={[20.42, -86.95]}
      zoom={11}
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <FitToSightings groups={groups} />

      {groups.map((group) => {
        const total = group.sightings.reduce((sum, s) => sum + s.count, 0);
        return (
          <Marker
            key={group.key}
            position={[group.latitude, group.longitude]}
            icon={siteIcon(total)}
          >
            <Popup maxWidth={320} className="min-w-[280px]">
              <div className="flex flex-col p-1">
                <div className="flex items-center gap-2 border-b pb-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 m-0 text-sm leading-tight truncate">
                      {group.siteName ?? "Unnamed site"}
                    </h3>
                    <span className="text-[11px] text-gray-500">
                      {group.sightings.length}{" "}
                      {group.sightings.length === 1 ? "sighting" : "sightings"} &middot; {total}{" "}
                      individuals
                    </span>
                  </div>
                </div>

                <ul className="list-none p-0 m-0 max-h-72 overflow-y-auto">
                  {group.sightings.map((s) => (
                    <SightingRow key={s.id} sighting={s} />
                  ))}
                </ul>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
