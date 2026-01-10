/**
 * ゲーム全体・システム関連の型定義
 */

import { Matchup } from '../match/types';
import { Wrestler } from '../wrestler/types';
import { Heya } from '../heya/types';
import { YushoRecord } from '../banzuke/types';

/** ゲームフェーズ */
export type GamePhase = 'training' | 'tournament';

/** ゲームモード */
export type GameMode = 'Establish' | 'Inherit';

/** ログデータ */
export interface LogData {
    message?: string;
    key?: string;
    params?: Record<string, any>;
    type?: 'info' | 'warning' | 'error';
}

/** ログエントリー */
export interface LogEntry extends LogData {
    id: string;
    date: string;
    message: string; // The fallback or translated string at time of creation
}

/** ゲーム状態 */
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

    // Collection
    kimariteCounts: Record<string, number>; // ID -> Count
    unlockedAchievements: string[]; // Achievement IDs
}

/** セーブデータ */
export interface SaveData {
    version: number;
    timestamp: number;
    gameState: GameState;
    wrestlers: Wrestler[];
    retiredWrestlers: Wrestler[];
    heyas: Heya[];
    yushoHistory: YushoRecord[];
    logs: LogEntry[];
    usedNames: string[]; // Registry of all used shikona
}
