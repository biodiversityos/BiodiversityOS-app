export interface Sighting {
  id: string;
  latitude: number;
  longitude: number;
  species: string;
  count: number;
  behavior: string;
  observedAt: string;
  createdAt: string;
  comment: string | null;
  mediaUrl: string | null;
  wallet: string;
  sequenceNumber: number;
  consensusTimestamp: string;
}

export interface SightingsFilter {
  species?: string;
  behavior?: string;
  wallet?: string;
  observedAtGt?: string;
  observedAtLt?: string;
  observedAtGte?: string;
  observedAtLte?: string;
}

export interface SightingsResponse {
  data: {
    sightings: {
      items: Sighting[];
      total: number;
      hasMore: boolean;
    }
  }
}
