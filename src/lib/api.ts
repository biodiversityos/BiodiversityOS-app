import { Sighting, SightingSummary, SightingsFilter } from "@/types";

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

/** The browser cannot use the internal address; it must go through nginx. */
const PUBLIC_INDEXER_URL =
  process.env.NEXT_PUBLIC_INDEXER_URL ?? "https://indexer.biodiversityos.org/graphql";

const RETRIES = 3;

/**
 * The registry is append-only and new sightings arrive at human pace, so
 * re-querying the indexer for every visitor buys nothing. A short window keeps
 * a submitted sighting visible quickly while collapsing repeat traffic.
 */
const REVALIDATE_SECONDS = Number(process.env.INDEXER_REVALIDATE_SECONDS ?? 60);

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
        next: { revalidate: REVALIDATE_SECONDS },
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

const SUMMARY_QUERY = /* GraphQL */ `
  query Summaries($limit: Int!, $offset: Int!, $filter: RecordsFilter) {
    records(limit: $limit, offset: $offset, filter: $filter) {
      items { id latitude longitude species count siteName }
      total
      hasMore
    }
  }
`;

async function queryPage<T>(
  query: string,
  filter: SightingsFilter | undefined,
  offset: number,
): Promise<{ items: T[]; total: number; hasMore: boolean } | null> {
  const res = await postQuery({
    query,
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
  return json.data.records as { items: T[]; total: number; hasMore: boolean };
}

/** Walks every page of a query, stopping on error rather than looping. */
async function fetchAll<T>(query: string, filter?: SightingsFilter): Promise<T[]> {
  const first = await queryPage<T>(query, filter, 0);
  if (!first) return [];

  const items = [...first.items];
  while (items.length < first.total) {
    const next = await queryPage<T>(query, filter, items.length);
    if (!next || next.items.length === 0) break;
    items.push(...next.items);
  }
  return items;
}

/** Every matching sighting, in full. Used where the detail is actually needed. */
export const getSightings = (filter?: SightingsFilter): Promise<Sighting[]> =>
  fetchAll<Sighting>(RECORDS_QUERY, filter);

/**
 * Just enough to place every marker. Roughly a sixth of the full payload, which
 * is what the page shipped before: the map drew markers from records carrying
 * comments, media links and transaction hashes that only a popup ever reads.
 */
export const getSightingSummaries = (filter?: SightingsFilter): Promise<SightingSummary[]> =>
  fetchAll<SightingSummary>(SUMMARY_QUERY, filter);

/**
 * Full records for one dive site, fetched from the browser when its popup opens.
 * The active filter is passed through so the popup never shows sightings the
 * user has filtered out.
 */
export async function fetchSiteSightings(
  siteName: string,
  filter?: SightingsFilter,
): Promise<Sighting[]> {
  try {
    const res = await fetch(PUBLIC_INDEXER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: RECORDS_QUERY,
        variables: { limit: 500, offset: 0, filter: { ...(filter ?? {}), siteName } },
      }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data?.records?.items as Sighting[]) ?? [];
  } catch (err) {
    console.error("Site detail fetch failed:", err);
    return [];
  }
}

export const getSites = async (): Promise<string[]> => {
  const res = await postQuery({ query: "{ sites }" });
  if (!res || !res.ok) return [];
  const json = await res.json();
  return (json.data?.sites as string[]) ?? [];
};
