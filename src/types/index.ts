// ── Enums ────────────────────────────────────────────────────────────────────

export enum Species {
  NURSE_SHARK                = "nurse_shark",
  CARIBBEAN_REEF_SHARK       = "caribbean_reef_shark",
  GREAT_HAMMERHEAD_SHARK     = "great_hammerhead_shark",
  HAMMERHEAD_SHARK           = "hammerhead_shark",
  SCALLOPED_HAMMERHEAD_SHARK = "scalloped_hammerhead_shark",
  BULL_SHARK                 = "bull_shark",
  TIGER_SHARK                = "tiger_shark",
  WHALE_SHARK                = "whale_shark",
  SANDBAR_SHARK              = "sandbar_shark",
  UNKNOWN                    = "unknown",
}

export enum Behavior {
  SWIMMING   = "swimming",
  SHELTERING = "sheltering",
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
  [Species.NURSE_SHARK]:                "Nurse Shark",
  [Species.CARIBBEAN_REEF_SHARK]:       "Caribbean Reef Shark",
  [Species.GREAT_HAMMERHEAD_SHARK]:     "Great Hammerhead Shark",
  [Species.HAMMERHEAD_SHARK]:           "Hammerhead Shark",
  [Species.SCALLOPED_HAMMERHEAD_SHARK]: "Scalloped Hammerhead Shark",
  [Species.BULL_SHARK]:                 "Bull Shark",
  [Species.TIGER_SHARK]:                "Tiger Shark",
  [Species.WHALE_SHARK]:                "Whale Shark",
  [Species.SANDBAR_SHARK]:              "Sandbar Shark",
  [Species.UNKNOWN]:                    "Unknown",
};

/** Scientific names as recorded in the Cozumel field database. */
export const SPECIES_SCIENTIFIC: Record<Species, string> = {
  [Species.NURSE_SHARK]:                "Ginglymostoma cirratum",
  [Species.CARIBBEAN_REEF_SHARK]:       "Carcharhinus perezi",
  [Species.GREAT_HAMMERHEAD_SHARK]:     "Sphyrna mokarran",
  [Species.HAMMERHEAD_SHARK]:           "Sphyrna sp.",
  [Species.SCALLOPED_HAMMERHEAD_SHARK]: "Sphyrna lewini",
  [Species.BULL_SHARK]:                 "Carcharhinus leucas",
  [Species.TIGER_SHARK]:                "Galeocerdo cuvier",
  [Species.WHALE_SHARK]:                "Rhincodon typus",
  [Species.SANDBAR_SHARK]:              "Carcharhinus plumbeus",
  [Species.UNKNOWN]:                    "",
};

export const BEHAVIOR_LABELS: Record<Behavior, string> = {
  [Behavior.SWIMMING]:   "Swimming",
  [Behavior.SHELTERING]: "Sheltering",
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
  /** Null when the observation date was never recorded. */
  observedAt:  string | null;
  createdAt:   string;
  updatedAt:   string;
  comment:     string | null;
  mediaUrl:    string | null;
  siteName:    string | null;
  depthFt:     number | null;
  sizeClass:   string | null;
  reporter:    string;
  blockNumber: string;
  txHash:      string;
}

/**
 * What the map needs to place a marker. The full record — comments, media,
 * transaction hashes — is six times larger and is only ever read inside a
 * popup, so it is fetched when one opens rather than shipped with every page.
 */
export interface SightingSummary {
  id:        number;
  latitude:  number;
  longitude: number;
  species:   Species;
  count:     number;
  siteName:  string | null;
}

export interface SightingsFilter {
  species?:       Species;
  behavior?:      Behavior;
  reporter?:      string;
  siteName?:      string;
  observedAtGt?:  string;
  observedAtGte?: string;
  observedAtLt?:  string;
  observedAtLte?: string;
}

/** Shape the contract's submitRecord/updateRecord tuple expects. */
export interface SightingInput {
  latitude:   bigint;
  longitude:  bigint;
  species:    string;
  count:      number;
  behavior:   string;
  observedAt: bigint;
  mediaUrl:   string;
  comment:    string;
  siteName:   string;
  depthFt:    number;
  sizeClass:  string;
}
