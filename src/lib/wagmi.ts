import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo, celoAlfajores } from "viem/chains";

export const config = getDefaultConfig({
  appName: "BiodiversityOS",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "biodiversityos",
  chains: [celo, celoAlfajores],
  ssr: true,
});
