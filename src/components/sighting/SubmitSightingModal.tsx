"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Species, Behavior, SPECIES_LABELS, BEHAVIOR_LABELS, DEFAULTS } from "@/types";
import BiodiversityRegistryABI from "@/abi/BiodiversityRegistry.abi.json";

const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0x0"
) as `0x${string}`;

interface Props {
  onClose: () => void;
}

export default function SubmitSightingModal({ onClose }: Props) {
  const [form, setForm] = useState({
    latitude:   "",
    longitude:  "",
    species:    DEFAULTS.species   as Species,
    behavior:   DEFAULTS.behavior  as Behavior,
    count:      String(DEFAULTS.count),
    observedAt: new Date().toISOString().slice(0, 16),
    mediaUrl:   "",
    comment:    "",
  });

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lat = parseFloat(form.latitude);
    const lon = parseFloat(form.longitude);
    const observedAtUnix = BigInt(Math.floor(new Date(form.observedAt).getTime() / 1000));

    writeContract({
      address: CONTRACT_ADDRESS,
      abi:     BiodiversityRegistryABI,
      functionName: "submitRecord",
      args: [
        BigInt(Math.round(lat * 1_000_000)),   // int256 latitude  (1e6)
        BigInt(Math.round(lon * 1_000_000)),   // int256 longitude (1e6)
        form.species,
        Number(form.count) as unknown as bigint,
        form.behavior,
        observedAtUnix,
        form.mediaUrl,
        form.comment,
      ],
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Submit Sighting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 size={48} className="text-emerald-500" />
            <p className="font-semibold text-gray-800">Sighting submitted!</p>
            <p className="text-xs text-gray-400 font-mono break-all">{txHash}</p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-500 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Latitude</label>
                <input
                  type="number" step="any" required
                  placeholder="20.4558"
                  value={form.latitude}
                  onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                  className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Longitude</label>
                <input
                  type="number" step="any" required
                  placeholder="-86.9026"
                  value={form.longitude}
                  onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                  className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Species & Behavior */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Species</label>
                <select
                  value={form.species}
                  onChange={e => setForm(f => ({ ...f, species: e.target.value as Species }))}
                  className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {Object.values(Species).map(s => (
                    <option key={s} value={s}>{SPECIES_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Behavior</label>
                <select
                  value={form.behavior}
                  onChange={e => setForm(f => ({ ...f, behavior: e.target.value as Behavior }))}
                  className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {Object.values(Behavior).map(b => (
                    <option key={b} value={b}>{BEHAVIOR_LABELS[b]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Count & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Count</label>
                <input
                  type="number" min="1" max="1000" required
                  value={form.count}
                  onChange={e => setForm(f => ({ ...f, count: e.target.value }))}
                  className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Observed At</label>
                <input
                  type="datetime-local" required
                  value={form.observedAt}
                  onChange={e => setForm(f => ({ ...f, observedAt: e.target.value }))}
                  className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Media URL */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Media URL (IPFS, optional)</label>
              <input
                type="text"
                placeholder="ipfs://Qm..."
                value={form.mediaUrl}
                onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))}
                className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Comment (optional)</label>
              <textarea
                rows={2}
                maxLength={2000}
                placeholder="Describe the sighting..."
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg">
                <AlertCircle size={14} />
                <span>{error.message.slice(0, 120)}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="mt-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-full font-semibold text-sm transition-colors"
            >
              {(isPending || isConfirming) && <Loader2 size={15} className="animate-spin" />}
              {isPending ? "Confirm in wallet…" : isConfirming ? "Confirming…" : "Submit Sighting"}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}
