"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Sighting } from "@/types";
import { Droplet, Info, User } from "lucide-react";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapComponent({ sightings }: { sightings: Sighting[] }) {
  return (
    <MapContainer
      center={[20.37, -87.04]} // Golfo de Mexico
      zoom={6}
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {sightings.map((sighting) => (
        <Marker
          key={sighting.id}
          position={[sighting.latitude, sighting.longitude]}
          icon={customIcon}
        >
          <Popup className="min-w-[250px]">
            <div className="flex flex-col gap-2 p-1">
              <div className="flex items-center gap-2 mb-2 border-b pb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Droplet size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 m-0 text-base leading-none capitalize">
                    {sighting.species}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(sighting.observedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase font-semibold">
                    Count
                  </span>
                  <span className="font-medium text-gray-700">
                    {sighting.count}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase font-semibold">
                    Behavior
                  </span>
                  <span className="font-medium text-gray-700 capitalize">
                    {sighting.behavior}
                  </span>
                </div>
              </div>

              {sighting.comment && (
                <div className="mt-2 text-sm text-gray-600 italic bg-gray-50 p-2 rounded-md">
                  "{sighting.comment}"
                </div>
              )}

              <div className="mt-2 pt-2 border-t flex items-center gap-1 text-xs text-gray-400 font-mono">
                <User size={12} />
                <span className="truncate">{sighting.wallet}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
