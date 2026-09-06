"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { SightingSummary, SightingsFilter } from "@/types";

const Loading = () => (
  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white">
    Loading map…
  </div>
);

// Loaded on the client only: Leaflet touches `window` at import time.
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: Loading,
});

interface Props {
  sightings: SightingSummary[];
  filter?: SightingsFilter;
}

export default function InteractiveMap({ sightings, filter }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <MapComponent sightings={sightings} filter={filter} />
    </Suspense>
  );
}
