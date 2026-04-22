"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useState } from "react";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";

const SubmitSightingModal = dynamic(
  () => import("@/components/sighting/SubmitSightingModal"),
  { ssr: false }
);

export default function WalletBar() {
  const { isConnected } = useAccount();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="absolute top-4 right-4 z-[999] flex items-center gap-2">
        {isConnected && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg transition-colors"
          >
            <Plus size={14} />
            Submit Sighting
          </button>
        )}
        <ConnectButton
          chainStatus="icon"
          accountStatus="avatar"
          showBalance={false}
        />
      </div>

      {open && <SubmitSightingModal onClose={() => setOpen(false)} />}
    </>
  );
}
