"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { OCEAN_BASE, OCEAN_LABELS } from "@/lib/basemap";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

/** Re-centre the map whenever the external lat/lng changes (e.g. geolocation). */
function RecenterOnPick({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      map.setView([lat, lng], Math.max(map.getZoom(), 10));
    }
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface Props {
  lat?: number;
  lng?: number;
  onPick: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({ lat, lng, onPick }: Props) {
  return (
    <MapContainer
      center={[lat ?? 20.37, lng ?? -87.04]}
      zoom={5}
      style={{ height: 180, width: "100%", borderRadius: 8, cursor: "crosshair" }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url={OCEAN_BASE.url} attribution={OCEAN_BASE.attribution} maxZoom={OCEAN_BASE.maxZoom} />
      <TileLayer url={OCEAN_LABELS.url} maxZoom={OCEAN_LABELS.maxZoom} />
      <ClickHandler onPick={onPick} />
      <RecenterOnPick lat={lat} lng={lng} />
      {lat !== undefined && lng !== undefined && (
        <Marker position={[lat, lng]} icon={markerIcon} />
      )}
    </MapContainer>
  );
}
