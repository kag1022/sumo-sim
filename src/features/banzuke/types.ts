/**
 * 番付・階級関連の型定義
 */

/** 力士の階級 */
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

/** 相撲の部門 */
export type Division = 'Makuuchi' | 'Juryo' | 'Makushita' | 'Sandanme' | 'Jonidan' | 'Jonokuchi';

/** 場所ごとの成績ログ */
export interface BashoLog {
    bashoId: string;
    rank: Rank;
    rankNumber: number;
    rankSide: 'East' | 'West';
    wins: number;
    losses: number;
}

/** 優勝記録 */
export interface YushoRecord {
    bashoId: string; // e.g., "Year 1 - Jan"
    division: Division;
    wrestlerId: string;
    wrestlerName: string;
    wrestlerNameEn?: string;
    heyaName: string;
    heyaNameEn?: string;
    rank: string;
    wins: number;
    losses: number;
}
