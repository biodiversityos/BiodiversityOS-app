import { SightingsResponse, SightingsFilter } from "@/types";

export const getSightings = async (filter?: SightingsFilter) => {
  const query = `
    fragment SightingFields on Sighting {
      id
      latitude
      longitude
      species
      count
      behavior
      observedAt
      createdAt
      comment
      mediaUrl
      wallet
      sequenceNumber
      consensusTimestamp
    }

    query Sightings($limit: Int = 100, $offset: Int = 0, $filter: SightingsFilter) {
      sightings(limit: $limit, offset: $offset, filter: $filter) {
        items {
          ...SightingFields
        }
        total
        hasMore
      }
    }
  `;

  try {
    const res = await fetch("https://indexer.oceanwatch.xyz/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operationName: "Sightings",
        query,
        variables: { limit: 100, offset: 0, filter: filter || null }
      }),
      cache: 'no-store' 
    });

    const json: SightingsResponse = await res.json();
    return json.data.sightings.items;
  } catch (err) {
    console.error("GraphQL Fetch Error:", err);
    return [];
  }
};
