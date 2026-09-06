"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useSignMessage, useAccount } from "wagmi";
import { X, Loader2, CheckCircle2, AlertCircle, MapPin, Navigation, ImagePlus } from "lucide-react";
import dynamic from "next/dynamic";
import { Species, Behavior, SPECIES_LABELS, BEHAVIOR_LABELS, DEFAULTS } from "@/types";
import { CONTRACT_ADDRESS } from "@/hooks/useIsAccredited";
import BiodiversityRegistryABI from "@/abi/BiodiversityRegistry.abi.json";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), { ssr: false });

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

type UploadState = "idle" | "signing" | "uploading" | "done" | "error";

interface Props {
  onClose: () => void;
}

export default function SubmitSightingModal({ onClose }: Props) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [form, setForm] = useState({
    species:    DEFAULTS.species  as Species,
    behavior:   DEFAULTS.behavior as Behavior,
    count:      String(DEFAULTS.count),
    observedAt: new Date().toISOString().slice(0, 16),
    mediaUrl:   "",
    comment:    "",
    siteName:   "",
    depthFt:    "",
    sizeClass:  "",
  });

  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [uploadError, setUploadError] = useState("");

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // ── Geolocation ──────────────────────────────────────────────────────────
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoLoading(false);
      },
      () => {
        setGeoError("Unable to retrieve your location. Please pick manually.");
        setGeoLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // ── Image upload ─────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !address) return;

    setUploadError("");

    try {
      // The upload endpoint accepts only accredited reporters, proven by a
      // signature over a short-lived challenge rather than a shared secret.
      setUploadState("signing");
      const issuedAt = Math.floor(Date.now() / 1000);
      const signature = await signMessageAsync({
        message: `BiodiversityOS upload\naddress: ${address.toLowerCase()}\nissuedAt: ${issuedAt}`,
      });

      setUploadState("uploading");
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        headers: {
          "x-address": address,
          "x-issued-at": String(issuedAt),
          "x-signature": signature,
        },
        body: fd,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Upload failed (${res.status})`);
      }

      const json = (await res.json()) as { cid: string; url: string };
      setForm((f) => ({ ...f, mediaUrl: json.url }));
      setUploadedFilename(file.name);
      setUploadState("done");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setUploadState("error");
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lat === undefined || lng === undefined) return;

    const observedAtUnix = BigInt(Math.floor(new Date(form.observedAt).getTime() / 1000));

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: BiodiversityRegistryABI,
      functionName: "submitRecord",
      args: [
        {
          latitude:   BigInt(Math.round(lat * 1_000_000)),
          longitude:  BigInt(Math.round(lng * 1_000_000)),
          species:    form.species,
          count:      Number(form.count),
          behavior:   form.behavior,
          observedAt: observedAtUnix,
          mediaUrl:   form.mediaUrl,
          comment:    form.comment,
          siteName:   form.siteName.trim(),
          depthFt:    Number(form.depthFt) || 0,
          sizeClass:  form.sizeClass.trim(),
        },
      ],
    });
  };

  const locationReady = lat !== undefined && lng !== undefined;
  const uploadBusy = uploadState === "signing" || uploadState === "uploading";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Submit Sighting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 py-8 px-6 text-center">
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 pb-6 overflow-y-auto">

            {/* ── Location ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                  <MapPin size={11} /> Location
                </label>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={geoLoading}
                  className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-500 disabled:opacity-50 transition-colors"
                >
                  {geoLoading ? <Loader2 size={11} className="animate-spin" /> : <Navigation size={11} />}
                  Use My Location
                </button>
              </div>

              <div className="rounded-lg overflow-hidden border border-gray-200">
                <LocationPickerMap lat={lat} lng={lng} onPick={(lt, lg) => { setLat(lt); setLng(lg); }} />
              </div>

              {locationReady ? (
                <p className="text-[11px] font-mono text-gray-500 text-center">
                  {lat!.toFixed(5)}, {lng!.toFixed(5)}
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 text-center">Click the map or use your location</p>
              )}

              {geoError && <p className="text-[11px] text-red-500">{geoError}</p>}
            </div>

            {/* ── Dive site ────────────────────────────────────────── */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Dive site</label>
              <input
                type="text"
                placeholder="e.g. PASO DEL CEDRAL"
                value={form.siteName}
                onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))}
                className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* ── Species & Behavior ───────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Species</label>
                <select
                  value={form.species}
                  onChange={(e) => setForm((f) => ({ ...f, species: e.target.value as Species }))}
                  className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white w-full"
                >
                  {Object.values(Species).map((s) => (
                    <option key={s} value={s}>{SPECIES_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Behavior</label>
                <select
                  value={form.behavior}
                  onChange={(e) => setForm((f) => ({ ...f, behavior: e.target.value as Behavior }))}
                  className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white w-full"
                >
                  {Object.values(Behavior).map((b) => (
                    <option key={b} value={b}>{BEHAVIOR_LABELS[b]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Count & Date ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Count</label>
                <input
                  type="number" min="1" max="65535" required
                  value={form.count}
                  onChange={(e) => setForm((f) => ({ ...f, count: e.target.value }))}
                  className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Observed At</label>
                <input
                  type="datetime-local" required
                  value={form.observedAt}
                  onChange={(e) => setForm((f) => ({ ...f, observedAt: e.target.value }))}
                  className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* ── Depth & Size ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Depth (ft)</label>
                <input
                  type="number" min="0" max="65535" placeholder="optional"
                  value={form.depthFt}
                  onChange={(e) => setForm((f) => ({ ...f, depthFt: e.target.value }))}
                  className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Size</label>
                <input
                  type="text" placeholder="e.g. mediano"
                  value={form.sizeClass}
                  onChange={(e) => setForm((f) => ({ ...f, sizeClass: e.target.value }))}
                  className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* ── Image upload ─────────────────────────────────────── */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                <ImagePlus size={11} /> Photo (optional)
              </label>

              {uploadState === "done" ? (
                <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <span className="text-xs text-emerald-700 truncate">{uploadedFilename}</span>
                  <button
                    type="button"
                    onClick={() => { setUploadState("idle"); setForm((f) => ({ ...f, mediaUrl: "" })); }}
                    className="ml-auto text-gray-400 hover:text-gray-600"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-emerald-400 transition-colors">
                  {uploadBusy ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-emerald-500" />
                      <span className="text-xs text-gray-500">
                        {uploadState === "signing" ? "Confirm signature in wallet…" : "Uploading to IPFS…"}
                      </span>
                    </>
                  ) : (
                    <>
                      <ImagePlus size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-400">Click to select image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploadBusy}
                  />
                </label>
              )}

              {uploadState === "error" && <p className="text-[11px] text-red-500">{uploadError}</p>}
            </div>

            {/* ── Comment ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Comment (optional)</label>
              <textarea
                rows={2}
                maxLength={2000}
                placeholder="Describe the sighting…"
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                className="text-sm p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
              <p className="text-[10px] text-gray-400">
                Anything written here is published permanently on a public chain. Please
                do not include other people&apos;s names or private links.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error.message.split("\n")[0]}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || isConfirming || !locationReady || uploadBusy}
              className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-full font-semibold text-sm transition-colors"
            >
              {(isPending || isConfirming) && <Loader2 size={15} className="animate-spin" />}
              {!locationReady
                ? "Pick a location first"
                : isPending ? "Confirm in wallet…"
                : isConfirming ? "Confirming…"
                : "Submit Sighting"}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}
