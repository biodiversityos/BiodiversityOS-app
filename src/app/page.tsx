import InteractiveMap from "@/components/map/InteractiveMap";
import FilterPanel from "@/components/map/FilterPanel";
import { getSightings } from "@/lib/api";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: PageProps) {
  // Await searchParams in Next 15
  const params = await searchParams;
  const start = params?.start as string | undefined;
  const end = params?.end as string | undefined;
  const species = params?.species as string | undefined;
  const behavior = params?.behavior as string | undefined;

  const sightings = await getSightings({
    observedAtGte: start,
    observedAtLte: end,
    species: species || undefined,
    behavior: behavior || undefined
  });

  return (
    <main className="w-full h-full relative p-0 m-0 overflow-hidden">
      {/* Панель фильтрации слева сверху */}
      <FilterPanel totalSightings={sightings.length} />
      
      {/* Карта */}
      <InteractiveMap sightings={sightings} />
    </main>
  );
}
