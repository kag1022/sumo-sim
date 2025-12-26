export type Rank =
  | "Yokozuna"
  | "Ozeki"
  | "Sekiwake"
  | "Komusubi"
  | "Maegashira"
  | "Juryo";

export type Side = "East" | "West";

export type BashoOutcome = "Win" | "Loss" | "Absent";

export interface RikishiStatus {
  power: number; // Body: Power, Weight, Stamina
  technique: number; // Skill: Kimarite variety, evasion
  mind: number; // Spirit: Focus, Tachiai sharpness, Pressure resistance
}

export interface BashoPerformance {
  wins: number;
  losses: number;
  absences: number;
  history: BashoOutcome[]; // Array of results for days 1-15
}

export interface BashoHistoryEntry {
  bashoId: string; // e.g., "2025-01"
  rank: Rank;
  rankNumber: number;
  wins: number;
  losses: number;
  absences: number;
  specialPrize?: SpecialPrize[];
}

export type SpecialPrize = "Shukun-sho" | "Kanto-sho" | "Gino-sho";

export interface CareerRecord {
  totalWins: number;
  totalLosses: number;
  totalAbsences: number;
  highestRank: Rank;
  bashoHistory: BashoHistoryEntry[];
  specialPrizes: {
    shukun: number;
    kanto: number;
    gino: number;
  };
  kinboshi: number; // Gold stars (Maegashira beating Yokozuna)
  championships: number; // Yusho
}

export interface Rikishi {
  id: string;
  name: string;
  heyaId: string;

  // Current Rank Position
  rank: Rank;
  rankNumber: number; // For Maegashira/Juryo (e.g., 1 for Maegashira 1)
  side: Side;

  // Stats
  stats: RikishiStatus;

  // Dynamic State
  banzukePoint: number; // For sorting and promotion
  condition: number; // Daily multiplier (e.g. 0.9 - 1.1)
  age: number;
  experience: number; // XP for growth

  // Flags
  isKyujo: boolean; // Injured/Absent
  isKadoban: boolean; // Only for Ozeki

  // Current Basho Record
  currentBasho: BashoPerformance;

  // Historical Record
  career: CareerRecord;
}

export interface MatchResult {
  winnerId: string;
  loserId: string;
  kimarite: string;
  winnerPostMatchCondition: number; // Condition might change
  loserPostMatchCondition: number;
}
