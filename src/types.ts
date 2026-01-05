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
    | "Jonokuchi"
    | "MaeZumo";

export type TrainingType = 'shiko' | 'teppo' | 'moushi_ai' | 'rest';

export type GameMode = 'training' | 'tournament';

export interface WrestlerStats {
    mind: number;
    technique: number;
    body: number;
}

export interface Heya {
    id: string;
    name: string;
    shikonaPrefix: string;
    strengthMod: number; // 0.8 to 1.2
    wrestlerCount: number;
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
        matchHistory: string[]; // IDs of opponents fought in this basho
    };
    // New Fields
    nextBoutDay: number | null; // null if no match scheduled or ended
    potential: number; // 0-100 (Visible as Grade S-E)
    flexibility: number; // 0-100 (Hidden/Semi-hidden)
    weight: number; // kg
    height: number; // cm
    background: string; // Flavor text

    // Retirement System Fields
    age: number;
    maxRank: Rank;
    historyMaxLength: number;
    timeInHeya: number; // Months active
    injuryDuration: number; // Weeks (or Days)
    consecutiveLoseOrAbsent: number; // Bashos
    stress: number; // 0-100
}

export type Division = 'Makuuchi' | 'Juryo' | 'Makushita' | 'Sandanme' | 'Jonidan' | 'Jonokuchi';

export interface Matchup {
    east: Wrestler;
    west: Wrestler;
    winnerId: string | null;
    division: Division;
}

export interface Candidate extends Omit<Wrestler, 'history' | 'currentBashoStats' | 'nextBoutDay'> {
    scoutCost: number;
    revealedStats: string[]; // Keys of fields that are revealed
}

export interface LogEntry {
    id: string;
    date: string;
    message: string;
    type: 'info' | 'warning' | 'error';
}
