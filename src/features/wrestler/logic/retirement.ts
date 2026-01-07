import { Wrestler, Rank } from '../../../types';
import { RANK_VALUE_MAP } from '../../../utils/constants';

export const calculateSeverance = (wrestler: Wrestler): number => {
    // 1. Max Rank Bonus
    let rankBonus = 0;
    const rank = wrestler.maxRank;

    if (rank === 'Yokozuna') rankBonus = 100000000;
    else if (rank === 'Ozeki') rankBonus = 30000000;
    else if (['Sekiwake', 'Komusubi'].includes(rank)) rankBonus = 15000000;
    else if (['Maegashira'].includes(rank)) rankBonus = 10000000;
    else if (['Juryo'].includes(rank)) rankBonus = 3000000;
    else rankBonus = 0;

    // 2. Tenure Bonus
    // 100,000 JPY per Year. (timeInHeya is in months? Let's assume months for now or convert)
    // If timeInHeya is months:
    const years = Math.floor(wrestler.timeInHeya / 12);
    const tenureBonus = years * 100000;

    return rankBonus + tenureBonus;
};

// Helper to check if Max Rank needs update
// Using RANK_VALUE_MAP from constants
export const shouldUpdateMaxRank = (currentRank: Rank, maxRank: Rank): boolean => {
    const currentVal = RANK_VALUE_MAP[currentRank] || 0;
    const maxVal = RANK_VALUE_MAP[maxRank] || 0;
    return currentVal > maxVal;
};
// ... (previous code)

export interface RetirementCheckResult {
    retire: boolean;
    reason?: string;
    shouldConsult?: boolean; // プレイヤー部屋の場合、相談が必要
}

/**
 * 引退判定ロジック
 * @param wrestler 力士
 * @param isPlayerHeya プレイヤー部屋かどうか
 * @returns 引退判定結果
 */
export const shouldRetire = (wrestler: Wrestler, isPlayerHeya: boolean = false): RetirementCheckResult => {
    const { rank, age, currentBashoStats, history, maxRank, retirementStatus } = wrestler;
    const currentWins = currentBashoStats.wins;
    const isMakeKoshi = currentWins < 8;

    // Get last basho result
    const lastBasho = history.length > 0 ? history[history.length - 1] : null;
    const lastRank = lastBasho ? lastBasho.rank : 'MaeZumo';

    let retireResult: { retire: boolean, reason?: string } = { retire: false };

    // 1. Yokozuna Rules (The Dignity Rule)
    if (rank === 'Yokozuna') {
        // 2 consecutive Make-Koshi
        if (isMakeKoshi && lastBasho && lastBasho.wins < 8) {
            retireResult = { retire: true, reason: 'Yokozuna: Consecutive Make-Koshi' };
        }
        // 1 Make-Koshi + Age >= 30
        else if (isMakeKoshi && age >= 30) {
            // High probability (50%+)
            if (Math.random() < 0.7) {
                retireResult = { retire: true, reason: 'Yokozuna: Make-Koshi Over 30' };
            }
        }
        // Low Win Rate (Average < 8 in last 3)
        // Check history[last-2], history[last-1], current
    }

    // 2. Ozeki Rules
    // Check if Demoted from Ozeki and Failed Return (Need 10 wins)
    // Current Rank: Sekiwake (Demoted Ozeki status handles via 'isKadoban' mostly, but here we check status)
    // If wrestler WAS Ozeki recently. 
    // Logic: If MaxRank is Ozeki/Yokozuna, and currently Sekiwake/Lower.
    if (!retireResult.retire && (maxRank === 'Ozeki' || maxRank === 'Yokozuna')) {
        if (['Sekiwake', 'Komusubi', 'Maegashira', 'Juryo'].includes(rank)) {
            // If failed to return to Ozeki (e.g. didn't get 10 wins as Sekiwake)
            // Or just spiraling down.
            if (isMakeKoshi) {
                // Former Ozeki/Yokozuna getting Make-Koshi in lower ranks -> High retire chance
                if (Math.random() < 0.6) {
                    retireResult = { retire: true, reason: 'Former Ozeki: Dignity' };
                }
            }
            // Specific Ozeki Return Fail: Rank=Sekiwake, Last=Ozeki, Wins < 10
            if (!retireResult.retire && rank === 'Sekiwake' && lastRank === 'Ozeki' && currentWins < 10) {
                if (Math.random() < 0.4) {
                    retireResult = { retire: true, reason: 'Ozeki: Failed Re-promotion' };
                }
            }
        }
    }

    // 3. General Rules (Makuuchi / Juryo / Lower)
    // 3 Consecutive Make-Koshi + Age >= 30
    if (!retireResult.retire && age >= 30 && isMakeKoshi) {
        if (lastBasho && lastBasho.wins < 8) {
            const last2 = history.length > 1 ? history[history.length - 2] : null;
            if (last2 && last2.wins < 8) {
                // 3 Consecutive MK
                if (Math.random() < 0.5) {
                    retireResult = { retire: true, reason: 'Age & Performance Loop' };
                }
            }
        }
    }

    // Age Limits (Hard Caps)
    if (!retireResult.retire && age >= 35 && ['Makushita', 'Sandanme', 'Jonidan', 'Jonokuchi'].includes(rank)) {
        retireResult = { retire: true, reason: 'Age Limit (Lower Division)' };
    }
    if (!retireResult.retire && age >= 40) {
        retireResult = { retire: true, reason: 'Mandatory Retirement Age' };
    }

    // Injury Spiraling
    if (!retireResult.retire && wrestler.injuryStatus === 'injured' && isMakeKoshi && age >= 28) {
        if (Math.random() < 0.3) {
            retireResult = { retire: true, reason: 'Injury & Age' };
        }
    }

    // プレイヤー部屋特別処理
    if (isPlayerHeya && retireResult.retire) {
        // ラストチャンス状態で再度引退基準を満たした場合 → 強制引退（相談なし）
        if (retirementStatus === 'LastHanamichi') {
            return {
                retire: true,
                reason: `${retireResult.reason} (ラストチャンス失敗)`,
                shouldConsult: false
            };
        }

        // 通常状態で引退基準を満たした場合 → 相談モード
        if (retirementStatus === 'None' || !retirementStatus) {
            return {
                retire: false,
                reason: retireResult.reason,
                shouldConsult: true
            };
        }
    }

    return retireResult;
};

