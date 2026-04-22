export interface Sighting {
  id: number;
  latitude: number;
  longitude: number;
  species: string;
  count: number;
  behavior: string;
  observedAt: string;
  createdAt: string;
  updatedAt: string;
  comment: string | null;
  mediaUrl: string | null;
  reporter: string;
  blockNumber: string;
  txHash: string;
}

export interface SightingsFilter {
  species?: string;
  behavior?: string;
  reporter?: string;
  observedAtGt?: string;
  observedAtLt?: string;
}

export interface SightingsResponse {
  data: {
    records: {
      items: Sighting[];
      total: number;
      hasMore: boolean;
    }
  }
}
