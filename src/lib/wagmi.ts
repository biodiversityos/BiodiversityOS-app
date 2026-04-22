import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo, celoAlfajores } from "viem/chains";

// NEXT_PUBLIC_CHAIN=mainnet  → Celo mainnet first (default)
// NEXT_PUBLIC_CHAIN=testnet  → Celo Alfajores first (default)  ← dev default
const isMainnet = process.env.NEXT_PUBLIC_CHAIN === "mainnet";

export const config = getDefaultConfig({
  appName: "BiodiversityOS",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "biodiversityos",
  chains: isMainnet ? [celo, celoAlfajores] : [celoAlfajores, celo],
  ssr: true,
});
