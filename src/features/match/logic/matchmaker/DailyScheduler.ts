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
 * 対戦制約判定
 * @param p1 力士1
 * @param p2 力士2
 * @param day 何日目か
 * @param relaxConstraintB ルールB（上位陣温存）を無視するかどうか
 */
const isValidMatch = (p1: Wrestler, p2: Wrestler, day: number, relaxConstraintB: boolean = false): boolean => {
    // 1. 同部屋禁止 (Existing)
    if (p1.heyaId === p2.heyaId) return false;

    // 2. 対戦済み禁止 (Existing)
    if (p1.currentBashoStats.matchHistory.includes(p2.id)) return false;

    // --- 新ルール ---

    // A. 階級の壁 (Rank Barrier)
    // 幕内上位 (M5以上) vs 十両 は禁止
    const isHighRank = (w: Wrestler) => {
        if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi'].includes(w.rank)) return true;
        if (w.rank === 'Maegashira' && (w.rankNumber || 1) <= 5) return true;
        return false;
    };
    const isJuryo = (w: Wrestler) => w.rank === 'Juryo';

    if ((isHighRank(p1) && isJuryo(p2)) || (isHighRank(p2) && isJuryo(p1))) {
        return false;
    }

    // B. 上位陣対決の温存 (Save Best Bouts)
    // 12日目以前は 大関以上同士の対戦禁止
    if (!relaxConstraintB && day <= 12) {
        const isTop = (w: Wrestler) => ['Yokozuna', 'Ozeki'].includes(w.rank);
        if (isTop(p1) && isTop(p2)) {
            return false;
        }
    }

    return true;
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

        let opponent: Wrestler | null = null;

        // 検索パス 1: 厳格なルール
        for (let j = i + 1; j < sortedWrestlers.length; j++) {
            const candidate = sortedWrestlers[j];
            if (pairedIds.has(candidate.id)) continue;

            if (isValidMatch(east, candidate, day, false)) {
                opponent = candidate;
                break;
            }
        }

        // 検索パス 2: フォールバック (Rule B 無視)
        // 相手が見つからなかった場合のみ実行
        if (!opponent) {
            for (let j = i + 1; j < sortedWrestlers.length; j++) {
                const candidate = sortedWrestlers[j];
                if (pairedIds.has(candidate.id)) continue;

                // relaxConstraintB = true
                if (isValidMatch(east, candidate, day, true)) {
                    opponent = candidate;
                    break;
                }
            }
        }

        // ペアリング成立
        if (opponent) {
            matches.push({
                east,
                west: opponent,
                division: 'Makuuchi' // 便宜上
            });
            pairedIds.add(east.id);
            pairedIds.add(opponent.id);
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
    const todaysSekitoriMatches = scheduleSekitoriMatches(sekitoriPool, day);

    // Apply Tags
    const taggedMatches = todaysSekitoriMatches.map((m, index) => {
        const tags: string[] = [];

        // 1. Kinboshi Challenge (Maegashira vs Yokozuna)
        const isKinboshi = (w1: Wrestler, w2: Wrestler) =>
            (w1.rank === 'Maegashira' && w2.rank === 'Yokozuna') ||
            (w2.rank === 'Maegashira' && w1.rank === 'Yokozuna');

        if (isKinboshi(m.east, m.west)) {
            tags.push('KinboshiChallenge');
        }

        // 2. Senshuraku (Musubi no Ichiban) - Last match of Day 15
        if (day === 15 && index === todaysSekitoriMatches.length - 1) {
            tags.push('Senshuraku');
        }

        // 3. Title Bout (Day 13+, Top 3 contenders)
        // Note: Identifying top 3 requires full wrestler list context, which we have.
        // We'll approximate for now or assume logic should be robust.
        // To be safe, we can check if both have very high wins (e.g. within 2 of max possible).
        if (day >= 13) {
            const winsA = m.east.currentBashoStats.wins;
            const winsB = m.west.currentBashoStats.wins;
            const threshold = day - 3; // e.g. Day 13 requires 10+ wins
            if (winsA >= threshold && winsB >= threshold) {
                tags.push('TitleBout');
            }
        }

        return { ...m, tags };
    });

    todaysMatches.push(...taggedMatches);

    // 2. 幕下以下 (スイス式・出場調整あり)
    todaysMatches.push(...scheduleLowerDivisionMatches(divisions['Makushita'], day));
    todaysMatches.push(...scheduleLowerDivisionMatches(divisions['Sandanme'], day));
    todaysMatches.push(...scheduleLowerDivisionMatches(divisions['Jonidan'], day));
    todaysMatches.push(...scheduleLowerDivisionMatches(divisions['Jonokuchi'], day));

    return todaysMatches;
};
