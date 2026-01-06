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
    facilityLevel: number; // 1-5
    wrestlerCount: number;
}

// New Type for History
export interface BashoLog {
    bashoId: string;
    rank: Rank;
    rankNumber: number;
    rankSide: 'East' | 'West';
    wins: number;
    losses: number;
}

export interface Wrestler {
    id: string;
    heyaId: string;
    name: string;
    rank: Rank;
    rankSide?: 'East' | 'West';
    rankNumber?: number; // 1 = 1st, 2 = 2nd
    isKadoban?: boolean; // Ozeki Demotion Status
    stats: WrestlerStats;
    isSekitori: boolean;
    injuryStatus: 'healthy' | 'injured';
    history: BashoLog[]; // Updated type
    currentBashoStats: {
        wins: number;
        losses: number;
        matchHistory: string[]; // IDs of opponents fought in this basho
    };
    // Status Fields

    bantsukePriorRank?: Rank | null;
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

export interface YushoRecord {
    bashoId: string; // e.g., "Year 1 - Jan"
    division: Division;
    wrestlerId: string;
    wrestlerName: string;
    heyaName: string;
    rank: string;
    wins: number;
    losses: number;
}

export interface SaveData {
    version: number;
    timestamp: number;
    gameState: {
        currentDate: string; // saved as ISO string
        funds: number;
        gameMode: GameMode;
        bashoFinished: boolean;
        lastMonthBalance: number | null;
        isInitialized: boolean;
        oyakataName: string | null;
        okamiLevel: number;
        reputation: number;
        trainingPoints: number;
    };
    wrestlers: Wrestler[];
    heyas: Heya[];
    yushoHistory: YushoRecord[];
    logs: LogEntry[];
    usedNames: string[]; // Registry of all used shikona
}
