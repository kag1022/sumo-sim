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

/** 秘技スキルの種類 */
export type SkillType =
    | 'IronHead'     // 鉄の額: 常に戦闘力+5%
    | 'GiantKiller'  // 巨漢殺し: 相手が20kg以上重い場合、戦闘力+15%
    | 'EscapeArtist' // 逃げ足: 心属性判定時、ボーナス+20%
    | 'StaminaGod'   // 無尽蔵: 長期戦で有利（将来実装）
    | 'Bulldozer'    // 重戦車: 体属性判定時、ボーナス+10%
    | 'Lightning'    // 電光石火: 「技」属性の速攻が決まる
    | 'Intimidation'; // 横綱相撲: 格下の相手を萎縮させる

/** 引退ステータス */
export type RetirementStatus =
    | 'None'          // 通常
    | 'Thinking'      // 引退を考えている（相談待ち）
    | 'LastHanamichi' // 親方に引き止められたラストチャンス中
    | 'Retired';      // 引退済み

export type TrainingType = 'shiko' | 'teppo' | 'moushi_ai' | 'rest';

export type GamePhase = 'training' | 'tournament';
export type GameMode = 'Establish' | 'Inherit';

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
    reading: string; // Combined reading (e.g. "Kitanoumi")
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
        boutDays?: number[]; // Days fought in this basho (for rest day logic)
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
    origin: string; // Place of origin (e.g. "Hokkaido")

    // Retirement System Fields
    age: number;
    maxRank: Rank;
    historyMaxLength: number;
    timeInHeya: number; // Months active
    injuryDuration: number; // Weeks (or Days)
    consecutiveLoseOrAbsent: number; // Bashos
    stress: number; // 0-100

    // Skill System
    skills: SkillType[]; // 習得済みスキル（最大3つ）

    // Retirement Consultation System
    retirementStatus: RetirementStatus;
    retirementReason?: string; // 引退理由
}

// 以前のMatchResultは日次結果ログ用などに残すが、MatchPairを定義
export interface MatchPair {
    east: Wrestler;
    west: Wrestler;
    division: Division;
    tags?: string[]; // 'KinboshiChallenge', 'TitleBout', 'Senshuraku'
}

export interface MatchResult {
    day: number;
    winnerId: string;
    loserId: string;
    kimarite: string;
    winningAttribute: string;
}

export type Division = 'Makuuchi' | 'Juryo' | 'Makushita' | 'Sandanme' | 'Jonidan' | 'Jonokuchi';

export interface Matchup {
    east: Wrestler;
    west: Wrestler;
    winnerId: string | null;
    division: Division;
    kimarite?: string; // Optional result string
    triggeredSkills?: SkillType[]; // Skills that affected the outcome
    tags?: string[];
    tacticalBonus?: { east?: boolean; west?: boolean };
}

export interface Candidate extends Omit<Wrestler, 'history' | 'currentBashoStats' | 'nextBoutDay'> {
    scoutCost: number;
    revealedStats: string[]; // Keys of fields that are revealed
}

export interface LogData {
    message?: string;
    key?: string;
    params?: Record<string, any>;
    type?: 'info' | 'warning' | 'error';
}

export interface LogEntry extends LogData {
    id: string;
    date: string;
    // message is now optional in LogData, but for compatibility we might ensure it has a string fallback or handled in UI
    message: string; // The fallback or translated string at time of creation? 
    // Ideally UI translates on the fly. So message is fallback.
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

export interface GameState {
    currentDate: string; // saved as ISO string
    funds: number;
    gamePhase: GamePhase;
    gameMode: GameMode;
    bashoFinished: boolean;
    lastMonthBalance: number | null;
    isInitialized: boolean;
    oyakataName: string | null;
    okamiLevel: number;
    reputation: number;
    trainingPoints: number;
    matchesProcessed: boolean;
    todaysMatchups: Matchup[];
    autoRecruitAllowed: boolean;
}

export interface SaveData {
    version: number;
    timestamp: number;
    gameState: GameState;
    wrestlers: Wrestler[];
    heyas: Heya[];
    yushoHistory: YushoRecord[];
    logs: LogEntry[];
    usedNames: string[]; // Registry of all used shikona
}
