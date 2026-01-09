/**
 * 試合・勝敗関連の型定義
 */

import { Division } from '../banzuke/types';
import { Wrestler, SkillType } from '../wrestler/types';

/** 取組ペア */
export interface MatchPair {
    east: Wrestler;
    west: Wrestler;
    division: Division;
    tags?: string[]; // 'KinboshiChallenge', 'TitleBout', 'Senshuraku'
}

/** 試合結果 */
export interface MatchResult {
    day: number;
    winnerId: string;
    loserId: string;
    kimarite: string;
    winningAttribute: string;
}

/** 本日の取組 */
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
