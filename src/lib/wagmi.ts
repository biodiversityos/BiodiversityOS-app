import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { celo, celoAlfajores } from "viem/chains";

// NEXT_PUBLIC_CHAIN=mainnet  → Celo mainnet first (default)
// NEXT_PUBLIC_CHAIN=testnet  → Celo Alfajores first (default)  ← dev default
const isMainnet = process.env.NEXT_PUBLIC_CHAIN === "mainnet";

// alfajores-forno.celo-testnet.org has DNS issues; override with a working RPC.
// Use Ankr public endpoint or supply your own via NEXT_PUBLIC_ALFAJORES_RPC_URL.
const alfajoresRpc =
  process.env.NEXT_PUBLIC_ALFAJORES_RPC_URL ??
  "https://rpc.ankr.com/celo_alfajores";

export const config = getDefaultConfig({
  appName: "BiodiversityOS",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "biodiversityos",
  chains: isMainnet ? [celo, celoAlfajores] : [celoAlfajores, celo],
  transports: {
    [celo.id]:          http(),                 // uses viem default (forno.celo.org)
    [celoAlfajores.id]: http(alfajoresRpc),
  },
  ssr: true,
});
