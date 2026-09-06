"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { useState } from "react";
import { Plus, LogOut, ShieldAlert, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useIsAccredited } from "@/hooks/useIsAccredited";

const SubmitSightingModal = dynamic(
  () => import("@/components/sighting/SubmitSightingModal"),
  { ssr: false }
);

/** Explains the curated model instead of letting the chain reject a filled form. */
function NotAccreditedBadge() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-4 py-2 bg-white/90 backdrop-blur-md border border-amber-200 text-amber-700 text-xs font-bold rounded-full shadow-lg hover:bg-white transition-colors"
      >
        <ShieldAlert size={14} />
        Not an accredited reporter
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 text-xs text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-800 mb-1.5">Why can&apos;t I submit?</p>
          <p>
            Sightings in this registry come from accredited field reporters, so the
            record stays scientifically reviewable. Your wallet is not on that list
            yet.
          </p>
          <p className="mt-2">
            If you survey sharks around Cozumel and would like to contribute, contact
            the Mar Sustentable team with your wallet address.
          </p>
        </div>
      )}
    </div>
  );
}

export default function WalletBar() {
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const { isAccredited, isLoading } = useIsAccredited();

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
                {isLoading ? (
                  <span className="flex items-center gap-1.5 px-4 py-2 bg-white/90 backdrop-blur-md border border-gray-200 text-gray-500 text-xs font-bold rounded-full shadow-lg">
                    <Loader2 size={13} className="animate-spin" />
                    Checking access…
                  </span>
                ) : isAccredited ? (
                  <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg transition-colors"
                  >
                    <Plus size={14} />
                    Submit Sighting
                  </button>
                ) : (
                  <NotAccreditedBadge />
                )}

                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-white/20 rounded-full px-3 py-2 shadow-lg">
                  {chain.hasIcon && chain.iconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
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
