import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { celo, celoSepolia } from "viem/chains";

// NEXT_PUBLIC_CHAIN=mainnet  → Celo mainnet first (default)
// NEXT_PUBLIC_CHAIN=testnet  → Celo Sepolia first (default)  ← dev default
const isMainnet = process.env.NEXT_PUBLIC_CHAIN === "mainnet";

// celoSepolia default RPC is forno.celo-sepolia.celo-testnet.org (chainId 11142220).
// Override via NEXT_PUBLIC_TESTNET_RPC_URL if needed.
const testnetRpc =
  process.env.NEXT_PUBLIC_TESTNET_RPC_URL ??
  "https://forno.celo-sepolia.celo-testnet.org";

export const config = getDefaultConfig({
  appName: "BiodiversityOS",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "biodiversityos",
  chains: isMainnet ? [celo, celoSepolia] : [celoSepolia, celo],
  transports: {
    [celo.id]:       http(),
    [celoSepolia.id]: http(testnetRpc),
  },
  // Reduce polling to avoid hammering the RPC (default is 4s)
  pollingInterval: 10_000,
  ssr: true,
});
