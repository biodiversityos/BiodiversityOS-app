"use client";

import { useAccount, useReadContract } from "wagmi";
import BiodiversityRegistryABI from "@/abi/BiodiversityRegistry.abi.json";

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

/**
 * Whether the connected wallet may write to the registry. Checked up front so a
 * reporter is not asked to fill a form, pin a photo and sign a transaction only
 * for the chain to reject it.
 */
export function useIsAccredited() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, isError, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BiodiversityRegistryABI,
    functionName: "whitelist",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  return {
    address,
    isConnected,
    isAccredited: data === true,
    isLoading: isConnected && isLoading,
    isError,
    refetch,
  };
}
