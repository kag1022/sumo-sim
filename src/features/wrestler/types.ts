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

/** 育成方針タイプ */
export type TrainingType = 'shiko' | 'teppo' | 'moushi_ai' | 'rest';

/** 力士 */
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

/** スカウト候補 */
export interface Candidate extends Omit<Wrestler, 'history' | 'currentBashoStats' | 'nextBoutDay'> {
    scoutCost: number;
    revealedStats: string[]; // Keys of fields that are revealed
}
