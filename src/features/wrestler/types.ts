/**
 * 力士・育成関連の型定義
 */

import { Rank, BashoLog } from '../banzuke/types';

/** 力士のステータス */
export interface WrestlerStats {
    mind: number;
    technique: number;
    body: number;
}

/** 秘技スキルの種類 */
import { SkillKey } from './data/skillRegistry';

/** 秘技スキルの種類 */
export type SkillType = SkillKey;

/** 引退ステータス */
export type RetirementStatus =
    | 'None'          // 通常
    | 'Thinking'      // 引退を考えている（相談待ち）
    | 'LastHanamichi' // 親方に引き止められたラストチャンス中
    | 'Retired';      // 引退済み

/** 育成方針タイプ */
export type TrainingType = 'shiko' | 'teppo' | 'moushi_ai' | 'rest';

/** 力士 */
export interface Wrestler {
    id: string;
    heyaId: string;
    name: string; // Kanji (Japanese)
    reading: string; // Romaji (English Name)
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

    // Training Limit
    trainingHistory?: {
        weekId: string;
        count: number;
    };
}

/** スカウト候補 */
export interface Candidate extends Omit<Wrestler, 'history' | 'currentBashoStats' | 'nextBoutDay'> {
    scoutCost: number;
    revealedStats: string[]; // Keys of fields that are revealed
}
