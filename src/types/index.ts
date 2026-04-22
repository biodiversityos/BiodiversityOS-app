// ── Enums ────────────────────────────────────────────────────────────────────

export enum Species {
  NURSE_SHARK            = "nurse_shark",
  CARIBBEAN_REEF_SHARK   = "caribbean_reef_shark",
  GREAT_HAMMERHEAD_SHARK = "great_hammerhead_shark",
  HAMMERHEAD_SHARK       = "hammerhead_shark",
  BULL_SHARK             = "bull_shark",
  TIGER_SHARK            = "tiger_shark",
  WHALE_SHARK            = "whale_shark",
  UNKNOWN                = "unknown",
}

export enum Behavior {
  FEEDING   = "feeding",
  MIGRATING = "migrating",
  RESTING   = "resting",
  MATING    = "mating",
  HUNTING   = "hunting",
  STRANDED  = "stranded",
  UNKNOWN   = "unknown",
}

// ── Display labels ────────────────────────────────────────────────────────────

export const SPECIES_LABELS: Record<Species, string> = {
  [Species.NURSE_SHARK]:            "Nurse Shark",
  [Species.CARIBBEAN_REEF_SHARK]:   "Caribbean Reef Shark",
  [Species.GREAT_HAMMERHEAD_SHARK]: "Great Hammerhead Shark",
  [Species.HAMMERHEAD_SHARK]:       "Hammerhead Shark",
  [Species.BULL_SHARK]:             "Bull Shark",
  [Species.TIGER_SHARK]:            "Tiger Shark",
  [Species.WHALE_SHARK]:            "Whale Shark",
  [Species.UNKNOWN]:                "Unknown",
};

export const BEHAVIOR_LABELS: Record<Behavior, string> = {
  [Behavior.FEEDING]:   "Feeding",
  [Behavior.MIGRATING]: "Migrating",
  [Behavior.RESTING]:   "Resting",
  [Behavior.MATING]:    "Mating",
  [Behavior.HUNTING]:   "Hunting",
  [Behavior.STRANDED]:  "Stranded",
  [Behavior.UNKNOWN]:   "Unknown",
};

export const DEFAULTS = {
  species:  Species.UNKNOWN,
  behavior: Behavior.UNKNOWN,
  count:    1,
} as const;

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Sighting {
  id:          number;
  latitude:    number;
  longitude:   number;
  species:     Species;
  count:       number;
  behavior:    Behavior;
  observedAt:  string;
  createdAt:   string;
  updatedAt:   string;
  comment:     string | null;
  mediaUrl:    string | null;
  reporter:    string;
  blockNumber: string;
  txHash:      string;
}

export interface SightingsFilter {
  species?:      Species;
  behavior?:     Behavior;
  reporter?:     string;
  observedAtGt?: string;
  observedAtGte?: string;
  observedAtLt?: string;
  observedAtLte?: string;
}

export interface SightingsResponse {
  data: {
    records: {
      items:   Sighting[];
      total:   number;
      hasMore: boolean;
    };
  };
}
