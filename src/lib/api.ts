import { SightingsResponse, SightingsFilter } from "@/types";

const INDEXER_URL =
  process.env.NEXT_PUBLIC_INDEXER_URL ?? "http://91.98.145.4/graphql";

export const getSightings = async (filter?: SightingsFilter) => {
  const query = `
    fragment RecordFields on Record {
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
      reporter
      blockNumber
      txHash
    }

    query Records($limit: Int = 100, $offset: Int = 0, $filter: RecordsFilter) {
      records(limit: $limit, offset: $offset, filter: $filter) {
        items {
          ...RecordFields
        }
        total
        hasMore
      }
    }
  `;

  try {
    const res = await fetch(INDEXER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operationName: "Records",
        query,
        variables: { limit: 100, offset: 0, filter: filter || null }
      }),
      cache: "no-store"
    });

    const json: SightingsResponse = await res.json();

    if (!json.data?.records) {
      console.error("GraphQL error:", JSON.stringify(json));
      return [];
    }

    return json.data.records.items;
  } catch (err) {
    console.error("GraphQL Fetch Error:", err);
    return [];
  }
};
