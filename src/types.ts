export type Rank =
    | "Yokozuna"
    | "Ozeki"
    | "Sekiwake"
    | "Komusubi"
    | "Maegashira"
    | "Juryo"
    | "Makushita"
    | "Sandanme"
    | "Jonidan"
    | "Jonokuchi";

export type TrainingType = 'shiko' | 'teppo' | 'moushi_ai' | 'rest';

export type GameMode = 'training' | 'tournament';

export interface WrestlerStats {
    mind: number;
    technique: number;
    body: number;
}

export interface Wrestler {
    id: string;
    heyaId: string;
    name: string;
    rank: Rank;
    rankSide?: 'East' | 'West';
    rankNumber?: number;
    stats: WrestlerStats;
    isSekitori: boolean;
    injuryStatus: 'healthy' | 'injured';
    history: string[];
    currentBashoStats: {
        wins: number;
        losses: number;
    };
    // New Fields
    potential: number; // 0-100 (Visible as Grade S-E)
    flexibility: number; // 0-100 (Hidden/Semi-hidden)
    weight: number; // kg
    height: number; // cm
    background: string; // Flavor text
}

export interface Candidate extends Omit<Wrestler, 'history' | 'currentBashoStats'> {
    scoutCost: number;
    revealedStats: string[]; // Keys of fields that are revealed
}

export interface LogEntry {
    id: string;
    date: string;
    message: string;
    type: 'info' | 'warning' | 'error';
}
