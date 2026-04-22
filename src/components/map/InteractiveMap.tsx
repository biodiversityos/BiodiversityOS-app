"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Sighting } from "@/types";

// Динамический импорт карты, чтобы избежать ошибки "window is not defined" при SSR
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white">
      Загрузка карты...
    </div>
  ),
});

export default function InteractiveMap({ sightings }: { sightings: Sighting[] }) {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white">
        Загрузка карты...
      </div>
    }>
      <MapComponent sightings={sightings} />
    </Suspense>
  );
}
