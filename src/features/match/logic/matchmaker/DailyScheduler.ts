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
 * 幕内・十両のマッチング生成
 * @param wrestlers 対象力士
 * @param day 何日目か (1-15)
 */
const scheduleSekitoriMatches = (wrestlers: Wrestler[], day: number): MatchPair[] => {
    const matches: MatchPair[] = [];
    const pairedIds = new Set<string>();

    // ソート基準の切り替え
    let sortedWrestlers = [...wrestlers];

    if (day <= 10) {
        // Day 1-10: 番付順（基本）
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
 * 幕下以下のマッチング生成
 * @param wrestlers 対象力士
 * @param day 何日目か
 */
const scheduleLowerDivisionMatches = (wrestlers: Wrestler[], day: number): MatchPair[] => {
    const matches: MatchPair[] = [];

    // 出場資格のある力士を抽出
    // 条件1: 試合数が7未満
    // 条件2: 勝負がついていない (まだ7勝も7敗もしていない)
    // 条件3: 「今日出場番」の力士 (Dayの奇数偶数と、リスト内インデックス等で分散)
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

    // 今日戦う力士を選抜 (単純化のため、eligiblePoolを成績順にソートし、上からペアリングしていく)
    // ただし、全員が毎日戦うわけではないので、何らかの間引きが必要。
    // 「前回いつ戦ったか」の情報がないため、ランダム性や簡易ロジックで分散させる。
    // ここでは「出場可能な力士を一括でプールし、スイス式で可能な限り組む」アプローチをとるが、
    // まだ試合数が少ない人を優先するなどの重み付けをする。

    // 優先度スコア = (7 - 試合数) * 100 + ランダム(0-99)
    // これにより、試合消化が遅れている力士が優先的に選ばれる
    const prioritized = eligiblePool.map(w => ({
        wrestler: w,
        priority: (7 - (w.currentBashoStats.wins + w.currentBashoStats.losses)) * 100 + Math.random() * 50
    })).sort((a, b) => b.priority - a.priority);

    // 候補リスト
    const candidates = prioritized.map(p => p.wrestler);

    // 成績順（スイス式）でソートしてペアリング
    // ※優先度で選出しつつも、ペアリング自体は成績が近い者同士で行いたい
    // そのため、ここでは「今日出場させる候補」を先に確定させるのが理想だが、
    // 人数が奇数になる問題などがあるため、candidates全体から成績順にマッチングを試みる。

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

    // 1. 幕内・十両 (毎日)
    todaysMatches.push(...scheduleSekitoriMatches(divisions['Makuuchi'], day));
    todaysMatches.push(...scheduleSekitoriMatches(divisions['Juryo'], day));

    // 2. 幕下以下 (スイス式・出場調整あり)
    // 幕下以下は人数が多いので、すべての階級でマッチングを行う
    // ただし、15日間で7番なので、出場率は約50%以下
    todaysMatches.push(...scheduleLowerDivisionMatches(divisions['Makushita'], day));
    todaysMatches.push(...scheduleLowerDivisionMatches(divisions['Sandanme'], day));
    todaysMatches.push(...scheduleLowerDivisionMatches(divisions['Jonidan'], day));
    todaysMatches.push(...scheduleLowerDivisionMatches(divisions['Jonokuchi'], day));

    return todaysMatches;
};
