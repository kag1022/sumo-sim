/**
 * 日次動的スケジューラー
 * 
 * 毎日、その時点の力士の状況（成績、番付）に基づいて対戦カード（割）を生成する。
 * これにより、終盤の優勝争いや相星決戦などのドラマチックな展開を再現する。
 */

import { Wrestler, MatchPair, Division, Rank } from '../../../../types';

/** 階級を取得するヘルパー */
const getDivision = (rank: Rank): string => {
    if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(rank)) return 'Makuuchi';
    return rank;
};

/**
 * 番付スコアを取得（ペアリング用）
 */
const getBanzukeScore = (w: Wrestler): number => {
    const rankValue: Record<string, number> = {
        'Yokozuna': 1000,
        'Ozeki': 900,
        'Sekiwake': 800,
        'Komusubi': 700,
        'Maegashira': 600,
        'Juryo': 500,
        'Makushita': 400,
        'Sandanme': 300,
        'Jonidan': 200,
        'Jonokuchi': 100,
        'MaeZumo': 0
    };
    const base = rankValue[w.rank] || 0;
    const numBonus = 100 - (w.rankNumber || 1);
    const sideBonus = w.rankSide === 'East' ? 1 : 0;
    return base + numBonus + sideBonus;
};

/**
 * 全関取（幕内・十両）の統合マッチング生成
 * @param wrestlers 関取全リスト
 * @param day 何日目か (1-15)
 */
const scheduleSekitoriMatches = (wrestlers: Wrestler[], day: number): MatchPair[] => {
    const matches: MatchPair[] = [];
    const pairedIds = new Set<string>();

    // ソート基準の切り替え
    let sortedWrestlers = [...wrestlers];

    // Day 1-10: 番付順（基本）
    // 自然と「幕内下位 vs 十両上位」のような入替戦が発生する
    if (day <= 10) {
        sortedWrestlers.sort((a, b) => getBanzukeScore(b) - getBanzukeScore(a));
    } else {
        // Day 11-15: 勝星順（優勝争い優先）
        // 勝星が多い順 -> 番付順
        sortedWrestlers.sort((a, b) => {
            const winsA = a.currentBashoStats.wins;
            const winsB = b.currentBashoStats.wins;
            if (winsA !== winsB) return winsB - winsA; // 勝星降順
            return getBanzukeScore(b) - getBanzukeScore(a); // 同点なら番付順
        });
    }

    // マッチメイク
    for (let i = 0; i < sortedWrestlers.length; i++) {
        const east = sortedWrestlers[i];
        if (pairedIds.has(east.id)) continue;

        // 対戦候補を探す
        for (let j = i + 1; j < sortedWrestlers.length; j++) {
            const west = sortedWrestlers[j];
            if (pairedIds.has(west.id)) continue;

            // 既に対戦済みかチェック
            if (east.currentBashoStats.matchHistory.includes(west.id)) continue;

            // 同部屋チェック（優勝決定戦以外は当たらない）
            if (east.heyaId === west.heyaId) continue;

            // ペアリング成立
            matches.push({
                east,
                west,
                division: 'Makuuchi' // 混合戦の場合は上位のDivision名義にするか、eastのDivision
            });
            pairedIds.add(east.id);
            pairedIds.add(west.id);
            break;
        }
    }

    // あぶれた力士への対応（奇数の場合など）
    // 現状はマッチメイクなし（休み）とするが、将来的には幕下から吸い上げるロジックが必要

    return matches;
};

/**
 * 幕下以下のマッチング生成
 * @param wrestlers 対象力士
 * @param day 何日目か
 */
const scheduleLowerDivisionMatches = (wrestlers: Wrestler[], day: number): MatchPair[] => {
    const matches: MatchPair[] = [];

    // 出場資格のある力士を抽出
    const eligiblePool = wrestlers.filter(w => {
        const stats = w.currentBashoStats;
        const totalBouts = stats.wins + stats.losses;
        if (totalBouts >= 7) return false;
        if (stats.wins >= 7 || stats.losses >= 7) return false;

        // 連闘チェック
        const boutDays = stats.boutDays || [];
        if (boutDays.includes(day - 1)) return false;

        return true;
    });

    const prioritized = eligiblePool.map(w => ({
        wrestler: w,
        priority: (7 - (w.currentBashoStats.wins + w.currentBashoStats.losses)) * 100 + Math.random() * 50
    })).sort((a, b) => b.priority - a.priority);

    // 候補リスト
    const candidates = prioritized.map(p => p.wrestler);

    candidates.sort((a, b) => {
        const scoreA = a.currentBashoStats.wins - a.currentBashoStats.losses;
        const scoreB = b.currentBashoStats.wins - b.currentBashoStats.losses;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return getBanzukeScore(b) - getBanzukeScore(a);
    });

    const pairedIds = new Set<string>();

    for (let i = 0; i < candidates.length; i++) {
        const east = candidates[i];
        if (pairedIds.has(east.id)) continue;

        // 相手探し
        for (let j = i + 1; j < candidates.length; j++) {
            const west = candidates[j];
            if (pairedIds.has(west.id)) continue;

            // 既に対戦済みチェック
            if (east.currentBashoStats.matchHistory.includes(west.id)) continue;
            if (east.heyaId === west.heyaId) continue;

            // ペアリング成立
            matches.push({
                east,
                west,
                division: getDivision(east.rank) as Division
            });
            pairedIds.add(east.id);
            pairedIds.add(west.id);
            break;
        }
    }

    return matches;
};


/**
 * その日の全対戦カードを生成
 */
export const generateDailyMatches = (allWrestlers: Wrestler[], day: number): MatchPair[] => {
    // 怪我人などを除外
    const activeWrestlers = allWrestlers.filter(w =>
        w.rank !== 'MaeZumo' && w.injuryStatus !== 'injured'
    );

    // 階級ごとに分割
    const divisions: Record<string, Wrestler[]> = {
        'Makuuchi': [],
        'Juryo': [],
        'Makushita': [],
        'Sandanme': [],
        'Jonidan': [],
        'Jonokuchi': []
    };

    activeWrestlers.forEach(w => {
        const div = getDivision(w.rank);
        if (divisions[div]) {
            divisions[div].push(w);
        }
    });

    const todaysMatches: MatchPair[] = [];

    // 1. 関取（幕内・十両）統合プール
    const sekitoriPool = [...divisions['Makuuchi'], ...divisions['Juryo']];
    todaysMatches.push(...scheduleSekitoriMatches(sekitoriPool, day));

    // 2. 幕下以下 (スイス式・出場調整あり)
    todaysMatches.push(...scheduleLowerDivisionMatches(divisions['Makushita'], day));
    todaysMatches.push(...scheduleLowerDivisionMatches(divisions['Sandanme'], day));
    todaysMatches.push(...scheduleLowerDivisionMatches(divisions['Jonidan'], day));
    todaysMatches.push(...scheduleLowerDivisionMatches(divisions['Jonokuchi'], day));

    return todaysMatches;
};
