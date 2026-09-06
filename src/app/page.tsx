import InteractiveMap from "@/components/map/InteractiveMap";
import FilterPanel from "@/components/map/FilterPanel";
import WalletBar from "@/components/wallet/WalletBar";
import { getSightingSummaries, getSites } from "@/lib/api";
import { Species, Behavior } from "@/types";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Ignore hand-edited query values that are not part of the enum. */
function asEnum<T extends Record<string, string>>(
  e: T,
  value: string | undefined,
): T[keyof T] | undefined {
  if (!value) return undefined;
  return Object.values(e).includes(value) ? (value as T[keyof T]) : undefined;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  const filter = {
    observedAtGte: one(params?.start),
    observedAtLte: one(params?.end),
    species: asEnum(Species, one(params?.species)),
    behavior: asEnum(Behavior, one(params?.behavior)),
    siteName: one(params?.site),
  };

  const [sightings, sites] = await Promise.all([
    getSightingSummaries(filter),
    getSites(),
  ]);

  return (
    <main className="w-full h-full relative p-0 m-0 overflow-hidden">
      <FilterPanel totalSightings={sightings.length} sites={sites} />
      <WalletBar />
      <InteractiveMap sightings={sightings} filter={filter} />
    </main>
  );
}
