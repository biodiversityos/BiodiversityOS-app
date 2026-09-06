import { Sighting, SightingsFilter } from "@/types";

const INDEXER_URL =
  process.env.NEXT_PUBLIC_INDEXER_URL ?? "https://indexer.biodiversityos.org/graphql";

/** The indexer caps a single page at 1000; stay under it and page through. */
const PAGE_SIZE = 500;

const RECORD_FIELDS = `
  id
  latitude
  longitude
  species
  count
  behavior
  observedAt
  createdAt
  updatedAt
  comment
  mediaUrl
  siteName
  depthFt
  sizeClass
  reporter
  blockNumber
  txHash
`;

const RECORDS_QUERY = /* GraphQL */ `
  query Records($limit: Int!, $offset: Int!, $filter: RecordsFilter) {
    records(limit: $limit, offset: $offset, filter: $filter) {
      items { ${RECORD_FIELDS} }
      total
      hasMore
    }
  }
`;

interface RecordsPage {
  items: Sighting[];
  total: number;
  hasMore: boolean;
}

async function queryPage(
  filter: SightingsFilter | undefined,
  offset: number,
): Promise<RecordsPage | null> {
  try {
    const res = await fetch(INDEXER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: "Records",
        query: RECORDS_QUERY,
        variables: { limit: PAGE_SIZE, offset, filter: filter ?? null },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Indexer responded ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (!json.data?.records) {
      console.error("GraphQL error:", JSON.stringify(json.errors ?? json));
      return null;
    }
    return json.data.records as RecordsPage;
  } catch (err) {
    console.error("GraphQL fetch error:", err);
    return null;
  }
}

/**
 * Fetches every matching sighting. The dataset is a few thousand rows of field
 * observations, so the map wants all of them rather than an arbitrary first page.
 */
export const getSightings = async (filter?: SightingsFilter): Promise<Sighting[]> => {
  const first = await queryPage(filter, 0);
  if (!first) return [];

  const items = [...first.items];
  while (items.length < first.total) {
    const next = await queryPage(filter, items.length);
    // Stop on error or an empty page rather than looping forever.
    if (!next || next.items.length === 0) break;
    items.push(...next.items);
  }
  return items;
};

export const getSites = async (): Promise<string[]> => {
  try {
    const res = await fetch(INDEXER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ sites }" }),
      cache: "no-store",
    });
    const json = await res.json();
    return (json.data?.sites as string[]) ?? [];
  } catch (err) {
    console.error("GraphQL fetch error:", err);
    return [];
  }
};
