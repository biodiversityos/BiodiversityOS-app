"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { format } from "date-fns";
import { Species, Behavior, SPECIES_LABELS, BEHAVIOR_LABELS } from "@/types";

// The Cozumel survey starts in 2019; a later floor would silently hide the
// earliest years of the record.
const MIN_DATE = new Date("2019-01-01").getTime();

interface Props {
  totalSightings: number;
  sites: string[];
}

export default function FilterPanel({ totalSightings, sites }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const speciesParam = searchParams.get("species") ?? "";
  const behaviorParam = searchParams.get("behavior") ?? "";
  const siteParam = searchParams.get("site") ?? "";

  // Fixed upper bound keeps the first server and client renders identical.
  const maxDate = useMemo(() => new Date(`${new Date().getUTCFullYear() + 1}-01-01`).getTime(), []);

  const [range, setRange] = useState<[number, number]>([
    startParam ? new Date(startParam).getTime() : MIN_DATE,
    endParam ? new Date(endParam).getTime() : maxDate,
  ]);
  const [species, setSpecies] = useState(speciesParam);
  const [behavior, setBehavior] = useState(behaviorParam);
  const [site, setSite] = useState(siteParam);
  const [debouncedRange, setDebouncedRange] = useState(range);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedRange(range), 400);
    return () => clearTimeout(handler);
  }, [range]);

  useEffect(() => {
    const params = new URLSearchParams();

    // Only constrain dates once the user narrows them, so undated sightings and
    // the full history stay visible by default.
    if (debouncedRange[0] > MIN_DATE) params.set("start", new Date(debouncedRange[0]).toISOString());
    if (debouncedRange[1] < maxDate) params.set("end", new Date(debouncedRange[1]).toISOString());
    if (species) params.set("species", species);
    if (behavior) params.set("behavior", behavior);
    if (site) params.set("site", site);

    const next = params.toString();
    if (next !== searchParams.toString()) {
      router.push(next ? `/?${next}` : "/");
    }
  }, [debouncedRange, species, behavior, site, maxDate, router, searchParams]);

  const handleDateChange = (index: 0 | 1, e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date(e.target.value).getTime();
    if (Number.isNaN(d)) return;
    setRange((prev) => (index === 0 ? [d, prev[1]] : [prev[0], d]));
  };

  const resetFilters = () => {
    setRange([MIN_DATE, maxDate]);
    setSpecies("");
    setBehavior("");
    setSite("");
  };

  const filtersActive =
    Boolean(species || behavior || site) || range[0] > MIN_DATE || range[1] < maxDate;

  return (
    <div className="absolute top-4 left-4 z-[999] bg-white/90 backdrop-blur-md px-6 py-5 rounded-2xl shadow-xl border border-white/20 w-[350px] max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1">
        BiodiversityOS Map
      </h1>
      <p className="text-xs text-slate-500 font-medium mb-4">
        {totalSightings.toLocaleString()} {totalSightings === 1 ? "sighting" : "sightings"}
        {filtersActive ? " matching filters" : " on record"}
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col w-full">
            <label className="text-[10px] uppercase text-gray-500 font-bold mb-1">From</label>
            <input
              type="date"
              className="text-sm p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={format(range[0], "yyyy-MM-dd")}
              onChange={(e) => handleDateChange(0, e)}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="text-[10px] uppercase text-gray-500 font-bold mb-1">To</label>
            <input
              type="date"
              className="text-sm p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={format(range[1], "yyyy-MM-dd")}
              onChange={(e) => handleDateChange(1, e)}
            />
          </div>
        </div>

        <div className="px-2">
          <Slider
            range
            min={MIN_DATE}
            max={maxDate}
            value={range}
            onChange={(val) => setRange(val as [number, number])}
            styles={{
              track: { backgroundColor: "#3b82f6" },
              handle: {
                borderColor: "#3b82f6",
                backgroundColor: "#fff",
                opacity: 1,
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              },
            }}
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
            <span>{format(range[0], "MMM d, yyyy")}</span>
            <span>{format(range[1], "MMM d, yyyy")}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase text-gray-500 font-bold mb-1">Species</label>
            <select
              className="text-sm p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white w-full"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            >
              <option value="">Any species</option>
              {Object.values(Species).map((s) => (
                <option key={s} value={s}>{SPECIES_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] uppercase text-gray-500 font-bold mb-1">Behavior</label>
            <select
              className="text-sm p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white w-full"
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
            >
              <option value="">Any behavior</option>
              {Object.values(Behavior).map((b) => (
                <option key={b} value={b}>{BEHAVIOR_LABELS[b]}</option>
              ))}
            </select>
          </div>

          {sites.length > 0 && (
            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1">Dive site</label>
              <select
                className="text-sm p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white w-full"
                value={site}
                onChange={(e) => setSite(e.target.value)}
              >
                <option value="">Any site</option>
                {sites.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filtersActive && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 self-start"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
