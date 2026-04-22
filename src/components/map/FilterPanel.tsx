"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { format } from "date-fns";

const MIN_DATE = new Date("2024-01-01").getTime();
const MAX_DATE = new Date("2027-01-01").getTime();

export default function FilterPanel({ totalSightings }: { totalSightings: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const speciesParam = searchParams.get("species") || "";
  const behaviorParam = searchParams.get("behavior") || "";

  const [range, setRange] = useState([
    startParam ? new Date(startParam).getTime() : MIN_DATE,
    endParam ? new Date(endParam).getTime() : new Date().getTime()
  ]);
  const [species, setSpecies] = useState(speciesParam);
  const [behavior, setBehavior] = useState(behaviorParam);

  const [debouncedRange, setDebouncedRange] = useState(range);

  // Debounce the slider to avoid extreme network requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRange(range);
    }, 400); // 400ms delay
    return () => clearTimeout(handler);
  }, [range]);

  // Update URL Query Parameters
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const startStr = new Date(debouncedRange[0]).toISOString();
    const endStr = new Date(debouncedRange[1]).toISOString();
    
    // Only fetch if parameters changed logically
    if (startStr !== startParam || endStr !== endParam || species !== speciesParam || behavior !== behaviorParam) {
      params.set("start", startStr);
      params.set("end", endStr);
      
      if (species) params.set("species", species); else params.delete("species");
      if (behavior) params.set("behavior", behavior); else params.delete("behavior");
      
      // Update the URL without losing history and without a hard reload
      router.push(`/?${params.toString()}`);
    }
  }, [debouncedRange, species, behavior, searchParams, router, startParam, endParam, speciesParam, behaviorParam]);

  const handleDateChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date(e.target.value).getTime();
    if (!isNaN(d)) {
      setRange(prev => index === 0 ? [d, prev[1]] : [prev[0], d]);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[999] bg-white/90 backdrop-blur-md px-6 py-5 rounded-2xl shadow-xl border border-white/20 w-[350px]">
      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1">
        OceanWatch Map
      </h1>
      <p className="text-xs text-slate-500 font-medium mb-4">
        {totalSightings} sightings in time range
      </p>

      <div className="flex flex-col gap-4">
        {/* Date Pickers */}
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

        {/* Dropdowns */}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex flex-col w-full">
            <label className="text-[10px] uppercase text-gray-500 font-bold mb-1">Species</label>
            <select 
              className="text-sm p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            >
              <option value="">Any Species</option>
              {['unknown', 'nurse_shark', 'bull_shark', 'caribbean_reef_shark'].map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label className="text-[10px] uppercase text-gray-500 font-bold mb-1">Behavior</label>
            <select 
              className="text-sm p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
            >
              <option value="">Any Behavior</option>
              {['unknown', 'hunting', 'feeding', 'migrating', 'stranded', 'resting'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dual Slider */}
        <div className="px-2 pt-2 pb-1">
          <Slider 
            range
            min={MIN_DATE}
            max={MAX_DATE}
            value={range}
            onChange={(val) => setRange(val as number[])}
            styles={{
                track: { backgroundColor: '#3b82f6' },
                handle: { borderColor: '#3b82f6', backgroundColor: '#fff', opacity: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }
            }}
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
             <span>{format(range[0], "MMM d, yyyy")}</span>
             <span>{format(range[1], "MMM d, yyyy")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
