/**
 * 決まり手データ定義
 * 出典: 大相撲決まり手ランキング (平成25年～令和7年)
 */

/** 決まり手の技タイプ */
export type KimariteType = 'Push' | 'Grapple' | 'Throw' | 'Tech' | 'Special';

/** レアリティ */
export type KimariteRarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';

/** 決まり手定義インターフェース */
export interface KimariteDef {
    /** 一意識別子 (ローマ字) */
    id: string;
    /** 技タイプ */
    type: KimariteType;
    /** 基本発生重み (CSVの割合: 0~25.18) */
    baseWeight: number;
    /** レアリティ */
    rarity: KimariteRarity;
    /** 主に依存するステータス */
    requiredStat?: 'Body' | 'Tech' | 'Mind';
}

/**
 * 決まり手データ一覧
 * マッピングルール:
 * - 基本技(押し/突き系) → Push
 * - 基本技(寄り系) → Grapple
 * - 投げ手 → Throw
 * - 捻り手/掛け手 → Tech
 * - 特殊技/反り手/勝負結果 → Special
 */
export const KIMARITE_DATA: readonly KimariteDef[] = [
    // ============================================================
    // Common (基本発生確率 ≥3%)
    // ============================================================
    { id: 'oshidashi', type: 'Push', baseWeight: 25.18, rarity: 'Common', requiredStat: 'Body' },
    { id: 'yorikiri', type: 'Grapple', baseWeight: 24.93, rarity: 'Common', requiredStat: 'Body' },
    { id: 'hatakikomi', type: 'Special', baseWeight: 8.24, rarity: 'Common', requiredStat: 'Mind' },
    { id: 'tsukiotoshi', type: 'Tech', baseWeight: 5.38, rarity: 'Common', requiredStat: 'Tech' },
    { id: 'yoritaoshi', type: 'Grapple', baseWeight: 4.81, rarity: 'Common', requiredStat: 'Body' },
    { id: 'uwatenage', type: 'Throw', baseWeight: 4.63, rarity: 'Common', requiredStat: 'Tech' },
    { id: 'hikiotoshi', type: 'Special', baseWeight: 3.46, rarity: 'Common', requiredStat: 'Mind' },
    { id: 'oshitaoshi', type: 'Push', baseWeight: 3.44, rarity: 'Common', requiredStat: 'Body' },
    { id: 'okuridashi', type: 'Special', baseWeight: 3.28, rarity: 'Common', requiredStat: 'Tech' },

    // ============================================================
    // Uncommon (基本発生確率 0.5%~3%)
    // ============================================================
    { id: 'shitatenage', type: 'Throw', baseWeight: 2.28, rarity: 'Uncommon', requiredStat: 'Tech' },
    { id: 'tsukidashi', type: 'Push', baseWeight: 2.22, rarity: 'Uncommon', requiredStat: 'Body' },
    { id: 'sukuinage', type: 'Throw', baseWeight: 2.09, rarity: 'Uncommon', requiredStat: 'Tech' },
    { id: 'kotenage', type: 'Throw', baseWeight: 1.68, rarity: 'Uncommon', requiredStat: 'Tech' },
    { id: 'uwatedashinage', type: 'Throw', baseWeight: 1.29, rarity: 'Uncommon', requiredStat: 'Tech' },
    { id: 'katasukashi', type: 'Tech', baseWeight: 0.92, rarity: 'Uncommon', requiredStat: 'Mind' },
    { id: 'okuritaoshi', type: 'Special', baseWeight: 0.53, rarity: 'Uncommon', requiredStat: 'Tech' },

    // ============================================================
    // Rare (基本発生確率 0.02%~0.5%)
    // ============================================================
    { id: 'kimedashi', type: 'Special', baseWeight: 0.43, rarity: 'Rare', requiredStat: 'Body' },
    { id: 'shitatedashinage', type: 'Throw', baseWeight: 0.37, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'tsukitaoshi', type: 'Push', baseWeight: 0.34, rarity: 'Rare', requiredStat: 'Body' },
    { id: 'sotogake', type: 'Tech', baseWeight: 0.30, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'abisetaoshi', type: 'Grapple', baseWeight: 0.24, rarity: 'Rare', requiredStat: 'Body' },
    { id: 'kubinage', type: 'Throw', baseWeight: 0.22, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'utchari', type: 'Special', baseWeight: 0.22, rarity: 'Rare', requiredStat: 'Mind' },
    { id: 'tottari', type: 'Tech', baseWeight: 0.20, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'isamiashi', type: 'Special', baseWeight: 0.20, rarity: 'Rare', requiredStat: 'Mind' },
    { id: 'shitatehineri', type: 'Tech', baseWeight: 0.19, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'kirigaeshi', type: 'Tech', baseWeight: 0.17, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'hikkake', type: 'Special', baseWeight: 0.16, rarity: 'Rare', requiredStat: 'Mind' },
    { id: 'kakenage', type: 'Throw', baseWeight: 0.15, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'ashitori', type: 'Tech', baseWeight: 0.14, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'tsuridashi', type: 'Special', baseWeight: 0.14, rarity: 'Rare', requiredStat: 'Body' },
    { id: 'uwatehineri', type: 'Tech', baseWeight: 0.14, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'kimetaoshi', type: 'Special', baseWeight: 0.12, rarity: 'Rare', requiredStat: 'Body' },
    { id: 'watashikomi', type: 'Tech', baseWeight: 0.11, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'tsukihiza', type: 'Special', baseWeight: 0.11, rarity: 'Rare', requiredStat: 'Mind' },
    { id: 'uchigake', type: 'Tech', baseWeight: 0.08, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'kainahineri', type: 'Tech', baseWeight: 0.08, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'makiotoshi', type: 'Tech', baseWeight: 0.06, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'okuriage', type: 'Special', baseWeight: 0.06, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'kegaeshi', type: 'Tech', baseWeight: 0.06, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'amiuchi', type: 'Tech', baseWeight: 0.05, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'sukubikonashi', type: 'Special', baseWeight: 0.05, rarity: 'Rare', requiredStat: 'Mind' },
    { id: 'tsukite', type: 'Special', baseWeight: 0.05, rarity: 'Rare', requiredStat: 'Mind' },
    { id: 'susoharai', type: 'Tech', baseWeight: 0.04, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'zubunehineri', type: 'Tech', baseWeight: 0.03, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'harimanage', type: 'Tech', baseWeight: 0.03, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'uchimusou', type: 'Tech', baseWeight: 0.03, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'tokurinage', type: 'Tech', baseWeight: 0.03, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'koshikudake', type: 'Special', baseWeight: 0.03, rarity: 'Rare', requiredStat: 'Mind' },
    { id: 'kubihineri', type: 'Tech', baseWeight: 0.02, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'fumidashi', type: 'Special', baseWeight: 0.02, rarity: 'Rare', requiredStat: 'Mind' },
    { id: 'komatusukui', type: 'Tech', baseWeight: 0.02, rarity: 'Rare', requiredStat: 'Tech' },
    { id: 'nichonage', type: 'Throw', baseWeight: 0.02, rarity: 'Rare', requiredStat: 'Tech' },

    // ============================================================
    // Legendary (基本発生確率 <0.02%)
    // ============================================================
    { id: 'izori', type: 'Special', baseWeight: 0.01, rarity: 'Legendary', requiredStat: 'Tech' },
    { id: 'tsutaezori', type: 'Special', baseWeight: 0.01, rarity: 'Legendary', requiredStat: 'Tech' },
    { id: 'tasukizori', type: 'Special', baseWeight: 0.01, rarity: 'Legendary', requiredStat: 'Tech' },
    { id: 'ipponzeoi', type: 'Throw', baseWeight: 0.01, rarity: 'Legendary', requiredStat: 'Tech' },
    { id: 'kawazugake', type: 'Tech', baseWeight: 0.01, rarity: 'Legendary', requiredStat: 'Tech' },
    { id: 'sabaori', type: 'Tech', baseWeight: 0.005, rarity: 'Legendary', requiredStat: 'Body' },
    { id: 'koshinage', type: 'Throw', baseWeight: 0.005, rarity: 'Legendary', requiredStat: 'Tech' },
    { id: 'yaguranage', type: 'Throw', baseWeight: 0.001, rarity: 'Legendary', requiredStat: 'Body' },
    { id: 'tsukaminage', type: 'Throw', baseWeight: 0.001, rarity: 'Legendary', requiredStat: 'Body' },
    { id: 'shumokuzori', type: 'Special', baseWeight: 0.001, rarity: 'Legendary', requiredStat: 'Tech' },
] as const;

/**
 * 決まり手をIDで検索
 * @param id 決まり手ID
 * @returns 決まり手定義 or undefined
 */
export function findKimariteById(id: string): KimariteDef | undefined {
    return KIMARITE_DATA.find(k => k.id === id);
}
