import { Sighting, SightingsFilter } from "@/types";

/**
 * These queries run on the server, so they can take the short path.
 *
 * Reaching the indexer through its public hostname sends a call between two
 * containers on the same host out through DNS, hairpin NAT and nginx, and
 * Docker's resolver intermittently answers EAI_AGAIN on that path — which
 * renders as an empty map with no error anywhere the user can see.
 * INDEXER_INTERNAL_URL points straight at the container over a shared network.
 */
const INDEXER_URL =
  process.env.INDEXER_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_INDEXER_URL ??
  "https://indexer.biodiversityos.org/graphql";

const RETRIES = 3;

function isTransient(err: unknown): boolean {
  const code = (err as { cause?: { code?: string } })?.cause?.code;
  return code === "EAI_AGAIN" || code === "ECONNRESET" || code === "ETIMEDOUT";
}

async function postQuery(body: unknown): Promise<Response | null> {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      return await fetch(INDEXER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
    } catch (err) {
      // A name-resolution hiccup should cost a retry, not the whole page.
      if (attempt === RETRIES || !isTransient(err)) {
        console.error("Indexer fetch error:", err);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
    }
  }
  return null;
}

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
  const res = await postQuery({
    operationName: "Records",
    query: RECORDS_QUERY,
    variables: { limit: PAGE_SIZE, offset, filter: filter ?? null },
  });
  if (!res) return null;

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
  const res = await postQuery({ query: "{ sites }" });
  if (!res || !res.ok) return [];
  const json = await res.json();
  return (json.data?.sites as string[]) ?? [];
};
