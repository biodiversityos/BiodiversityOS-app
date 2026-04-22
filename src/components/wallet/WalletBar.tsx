"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { useState } from "react";
import { Plus, LogOut } from "lucide-react";
import dynamic from "next/dynamic";

const SubmitSightingModal = dynamic(
  () => import("@/components/sighting/SubmitSightingModal"),
  { ssr: false }
);

export default function WalletBar() {
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="absolute top-4 right-4 z-[999] flex items-center gap-2">
        <ConnectButton.Custom>
          {({ account, chain, openChainModal, openConnectModal, mounted }) => {
            const connected = mounted && account && chain;

            if (!mounted) return <div aria-hidden="true" style={{ opacity: 0 }} />;

            if (!connected) {
              return (
                <button
                  onClick={openConnectModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg transition-colors"
                >
                  Connect Wallet
                </button>
              );
            }

            if (chain.unsupported) {
              return (
                <button
                  onClick={openChainModal}
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-full shadow-lg transition-colors"
                >
                  Wrong Network
                </button>
              );
            }

            return (
              <div className="flex items-center gap-2">
                {/* Submit Sighting */}
                <button
                  onClick={() => setOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg transition-colors"
                >
                  <Plus size={14} />
                  Submit Sighting
                </button>

                {/* Address chip */}
                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-white/20 rounded-full px-3 py-2 shadow-lg">
                  {chain.hasIcon && chain.iconUrl && (
                    <img src={chain.iconUrl} alt={chain.name} className="w-4 h-4 rounded-full" />
                  )}
                  <span className="text-xs font-mono font-semibold text-gray-700">
                    {account.displayName}
                  </span>
                  <button
                    onClick={() => disconnect()}
                    title="Disconnect"
                    className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>

      {open && <SubmitSightingModal onClose={() => setOpen(false)} />}
    </>
  );
}
