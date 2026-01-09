/**
 * 決まり手選択ロジック
 * 勝者のステータスに基づき、重み付けランダム抽選で決まり手を決定する
 */

import { Wrestler } from '../../../types';
import { KIMARITE_DATA, KimariteDef, KimariteType } from '../data/kimariteData';

/** 勝ち手スタイル */
type WinningStyle = 'Body' | 'Tech' | 'Mind';

/** 各スタイルに応じた優先技タイプ */
const STYLE_PREFERRED_TYPES: Record<WinningStyle, KimariteType[]> = {
    Body: ['Push', 'Grapple'],
    Tech: ['Throw', 'Tech'],
    Mind: ['Tech', 'Special'],
};

/** スタイル一致時の重み倍率 */
const PREFERRED_STYLE_MULTIPLIER = 2.0;
/** スタイル不一致時の重み倍率 */
const NON_PREFERRED_STYLE_MULTIPLIER = 0.5;
/** Legendary/Rare技の強制発動確率 */
const RARE_MOVE_INJECTION_CHANCE = 0.005; // 0.5%

/**
 * 勝者の支配的ステータスを判定
 * @param wrestler 力士
 * @returns 支配的なステータス
 */
function getDominantStat(wrestler: Wrestler): WinningStyle {
    const { body, technique, mind } = wrestler.stats;
    if (body >= technique && body >= mind) return 'Body';
    if (technique >= mind) return 'Tech';
    return 'Mind';
}

/**
 * 重み付きランダム抽選
 * @param candidates 候補リスト
 * @param getWeight 重み取得関数
 * @returns 選ばれた候補
 */
function weightedRandomSelect<T>(candidates: T[], getWeight: (item: T) => number): T {
    const totalWeight = candidates.reduce((sum, item) => sum + getWeight(item), 0);
    if (totalWeight <= 0) {
        // フォールバック: 重みがない場合ランダム選択
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    let random = Math.random() * totalWeight;
    for (const item of candidates) {
        random -= getWeight(item);
        if (random <= 0) {
            return item;
        }
    }

    // フォールバック: 最後の候補を返す
    return candidates[candidates.length - 1];
}

/**
 * 決まり手を決定する
 * @param winner 勝者
 * @param _loser 敗者 (将来の拡張用)
 * @returns 決まり手の日本語名
 */
export function determineKimarite(winner: Wrestler, _loser: Wrestler): string {
    // 1. Rare Move Injection (番狂わせ)
    if (Math.random() < RARE_MOVE_INJECTION_CHANCE) {
        const rareMoves = KIMARITE_DATA.filter(k => k.rarity === 'Legendary' || k.rarity === 'Rare');
        if (rareMoves.length > 0) {
            const selected = weightedRandomSelect(rareMoves, k => k.baseWeight);
            return selected.id;
        }
    }

    // 2. 勝者の支配的ステータスを判定
    const dominantStat = getDominantStat(winner);
    const preferredTypes = STYLE_PREFERRED_TYPES[dominantStat];

    // 3. 各技の最終重みを計算
    const calculateFinalWeight = (kimarite: KimariteDef): number => {
        const isPreferred = preferredTypes.includes(kimarite.type);
        const styleMultiplier = isPreferred ? PREFERRED_STYLE_MULTIPLIER : NON_PREFERRED_STYLE_MULTIPLIER;
        return kimarite.baseWeight * styleMultiplier;
    };

    // 4. 重み付きランダム抽選
    const selected = weightedRandomSelect([...KIMARITE_DATA], calculateFinalWeight);

    return selected.id;
}

/**
 * テスト用: デバッグ情報付きで決まり手を決定する
 * @param winner 勝者
 * @param loser 敗者
 * @returns 決まり手情報
 */
export function determineKimariteWithDebug(winner: Wrestler, _loser: Wrestler): {
    kimarite: string;
    dominantStat: WinningStyle;
    wasRareInjection: boolean;
} {
    // Rare Move Injection チェック
    const wasRareInjection = Math.random() < RARE_MOVE_INJECTION_CHANCE;

    if (wasRareInjection) {
        const rareMoves = KIMARITE_DATA.filter(k => k.rarity === 'Legendary' || k.rarity === 'Rare');
        if (rareMoves.length > 0) {
            const selected = weightedRandomSelect(rareMoves, k => k.baseWeight);
            return {
                kimarite: selected.id,
                dominantStat: getDominantStat(winner),
                wasRareInjection: true,
            };
        }
    }

    const dominantStat = getDominantStat(winner);
    const preferredTypes = STYLE_PREFERRED_TYPES[dominantStat];

    const calculateFinalWeight = (kimarite: KimariteDef): number => {
        const isPreferred = preferredTypes.includes(kimarite.type);
        const styleMultiplier = isPreferred ? PREFERRED_STYLE_MULTIPLIER : NON_PREFERRED_STYLE_MULTIPLIER;
        return kimarite.baseWeight * styleMultiplier;
    };

    const selected = weightedRandomSelect([...KIMARITE_DATA], calculateFinalWeight);

    return {
        kimarite: selected.id,
        dominantStat,
        wasRareInjection: false,
    };
}
