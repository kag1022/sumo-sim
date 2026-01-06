import { Wrestler, Rank, BashoLog } from '../../../types';
import {
    QUOTA_OZEKI_MIN, QUOTA_SEKIWAKE, QUOTA_KOMUSUBI,
    QUOTA_MAKUUCHI, QUOTA_JURYO, QUOTA_MAKUSHITA, QUOTA_SANDANME, QUOTA_JONIDAN
} from '../../../utils/constants';

// --- Scoring Constants ---
const BASE_SCORE_YOKOZUNA = 20000; // Unreachable
const BASE_SCORE_OZEKI = 10000;
const BASE_SCORE_SEKIWAKE = 8000;
const BASE_SCORE_KOMUSUBI = 7000;
// Maegashira base scores are calculated dynamically

// Tuning Keys
const WIN_COEFF_HIGH = 150; // Points per win-diff

const getBaseScore = (rank: Rank, rankNum: number = 1): number => {
    // Return approximate "Ladder" value.
    if (rank === 'Yokozuna') return BASE_SCORE_YOKOZUNA;
    if (rank === 'Ozeki') return BASE_SCORE_OZEKI;
    if (rank === 'Sekiwake') return BASE_SCORE_SEKIWAKE;
    if (rank === 'Komusubi') return BASE_SCORE_KOMUSUBI;

    // Maegashira: 4000 ~ 6000
    if (rank === 'Maegashira') return 6000 - (rankNum * 100);
    // M1 = 5900, M10 = 5000, M17 = 4300.

    // Juryo: 3000 ~ 3900
    if (rank === 'Juryo') return 3900 - (rankNum * 70);
    // J1 = 3830, J14 = 2920.

    // Makushita: 1000 ~ 2900
    if (rank === 'Makushita') return 2900 - (rankNum * 30);
    // Ms1 = 2870, Ms60 = 1100.

    // Sandanme & Below: Lower
    if (rank === 'Sandanme') return 1000;
    if (rank === 'Jonidan') return 500;
    if (rank === 'Jonokuchi') return 100;
    return 0;
};

// --- Main Helper Functions ---

const calculateDraftScore = (w: Wrestler): number => {
    // 1. Base Score from CURRENT status
    const base = getBaseScore(w.rank, w.rankNumber);
    const diff = w.currentBashoStats.wins - w.currentBashoStats.losses;

    // Win Bonus for lower ranks to encourage rotation
    let coeff = WIN_COEFF_HIGH;
    // Boost for winning record in lower divs
    if (!w.isSekitori) {
        coeff = 200; // Higher mobility
    }

    return base + (diff * coeff);
};

// 2. Update Banzuke
export const updateBanzuke = (wrestlers: Wrestler[], bashoId: string = "Recent Basho"): Wrestler[] => {
    // Capture original ranks for history
    const originalRanks = new Map(wrestlers.map(w => [w.id, {
        rank: w.rank,
        rankNumber: w.rankNumber,
        rankSide: w.rankSide
    }]));

    // Pool all active wrestlers
    const pool = wrestlers.map(w => ({ ...w })); // Shallow copy

    // Lists for Fixed Status (Y/O/S/K)
    const nextYokozuna: Wrestler[] = [];
    const nextOzeki: Wrestler[] = [];
    let candidates: Wrestler[] = [];

    // --- Phase 1: Status Processing (Y/O) ---
    pool.forEach(w => {
        const { wins } = w.currentBashoStats;

        // A. YOKOZUNA
        if (w.rank === 'Yokozuna') {
            // Immutable
            nextYokozuna.push(w);
            return;
        }

        // B. OZEKI
        if (w.rank === 'Ozeki') {
            if (wins >= 8) {
                // Keep Ozeki, Clear Kadoban
                w.isKadoban = false;
                nextOzeki.push(w);
            } else {
                // Losing Record
                if (w.isKadoban) {
                    // DEMOTION: Fall to Sekiwake (Candidate Pool)
                    // We must ensure they are placed HIGH in the candidate pool.
                    // We'll set their special score later or just push to candidates.
                    w.isKadoban = false;
                    w.bantsukePriorRank = 'Ozeki'; // Mark for return rule
                    candidates.push(w); // Will be sorted by score
                } else {
                    // KADOBAN: Stay Ozeki
                    w.isKadoban = true;
                    nextOzeki.push(w);
                }
            }
            return;
        }

        // C. OZEKI RETURN RULE (For current Sekiwake who was Ozeki)
        if (w.rank === 'Sekiwake' && w.bantsukePriorRank === 'Ozeki') {
            if (wins >= 10) {
                // Return to Ozeki!
                w.bantsukePriorRank = null; // Clear flag
                w.rank = 'Ozeki'; // Provisional
                nextOzeki.push(w);
                return;
            }
            // If failed return, usually clears after 1 basho? 
            // Standard rule: Only valid for immediate next basho.
            w.bantsukePriorRank = null;
        }

        // Reset Prior Rank if not used
        if (w.rank !== 'Sekiwake') w.bantsukePriorRank = null;

        // D. EVERYONE ELSE
        candidates.push(w);
    });


    // --- Phase 2: Calculate Scores for Candidates ---
    // Candidates include: Demoted Ozeki, Sekiwake, Komusubi, M, J, Ms...
    candidates = candidates.map(w => {
        let score = calculateDraftScore(w);

        // Adjust for Demoted Ozeki (Soft landing at Sekiwake)
        if (w.bantsukePriorRank === 'Ozeki' && w.rank === 'Ozeki') {
            // Note: If they are demoted, they kept 'Ozeki' rank string in memory until now?
            // No, in candidates.push(w), w is reference.
            // But we didn't change w.rank in Phase 1 loop for demoted Ozeki.
            // So w.rank is still 'Ozeki'.
            // They should score as 'Sekiwake Top'.
            score = BASE_SCORE_SEKIWAKE + 500;
        }

        return { ...w, _tempScore: score };
    });

    // --- Phase 3: Sort Candidates ---
    candidates.sort((a: any, b: any) => b._tempScore - a._tempScore);


    // --- Phase 4: Fill the Void (Waterfall) ---

    // 4a. Ozeki Filling (Min 2)
    while (nextOzeki.length < QUOTA_OZEKI_MIN) {
        const c = candidates.shift();
        if (!c) break;
        c.rank = 'Ozeki';
        c.isKadoban = false;
        c.bantsukePriorRank = null;
        nextOzeki.push(c);
    }

    // Performance Promotion (Optional - skipped for strict adherence)

    const nextSekiwake: Wrestler[] = [];
    const nextKomusubi: Wrestler[] = [];
    const nextMaegashira: Wrestler[] = [];
    const nextJuryo: Wrestler[] = [];
    const nextMakushita: Wrestler[] = [];
    const nextSandanme: Wrestler[] = [];
    const nextJonidan: Wrestler[] = [];
    const nextJonokuchi: Wrestler[] = [];

    // Helper: Fill List from Candidates
    const fillList = (targetList: Wrestler[], count: number, rankName: Rank, sekitori: boolean) => {
        for (let i = 0; i < count; i++) {
            const w = candidates.shift();
            if (!w) break;

            w.rank = rankName;
            w.isSekitori = sekitori;

            // Assign Number/Side
            w.rankNumber = Math.floor(i / 2) + 1;
            w.rankSide = (i % 2 === 0) ? 'East' : 'West';

            targetList.push(w);
        }
    };

    // 4b. Sekiwake (Fixed 2)
    fillList(nextSekiwake, QUOTA_SEKIWAKE, 'Sekiwake', true);

    // 4c. Komusubi (Fixed 2)
    fillList(nextKomusubi, QUOTA_KOMUSUBI, 'Komusubi', true);

    // 4d. Maegashira (Rest of Makuuchi Quota)
    // Used slots so far:
    const usedMakuuchi = nextYokozuna.length + nextOzeki.length + nextSekiwake.length + nextKomusubi.length;
    const makuuchiSlots = Math.max(0, QUOTA_MAKUUCHI - usedMakuuchi);
    fillList(nextMaegashira, makuuchiSlots, 'Maegashira', true);

    // 4e. Juryo (28)
    fillList(nextJuryo, QUOTA_JURYO, 'Juryo', true);

    // 4f. Makushita (120)
    fillList(nextMakushita, QUOTA_MAKUSHITA, 'Makushita', false);

    // 4g. Sandanme (200)
    fillList(nextSandanme, QUOTA_SANDANME, 'Sandanme', false);

    // 4h. Jonidan (200)
    fillList(nextJonidan, QUOTA_JONIDAN, 'Jonidan', false);

    // 4i. Jonokuchi (Rest)
    fillList(nextJonokuchi, candidates.length, 'Jonokuchi', false);

    // --- Phase 5: Recombine ---
    const finalRoster = [
        ...nextYokozuna,
        ...nextOzeki,
        ...nextSekiwake,
        ...nextKomusubi,
        ...nextMaegashira,
        ...nextJuryo,
        ...nextMakushita,
        ...nextSandanme,
        ...nextJonidan,
        ...nextJonokuchi
    ];

    // Reset Stats
    return finalRoster.map(w => {
        const orig = originalRanks.get(w.id);
        const log: BashoLog = {
            bashoId: bashoId,
            rank: orig?.rank || 'MaeZumo',
            rankNumber: orig?.rankNumber || 1,
            rankSide: orig?.rankSide || 'East',
            wins: w.currentBashoStats.wins,
            losses: w.currentBashoStats.losses
        };

        return {
            ...w,
            currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
            history: [...w.history, log]
        };
    });
};



export const calculateBanzukeScore = (_w: Wrestler): number => {
    return 0; // Deprecated
};
