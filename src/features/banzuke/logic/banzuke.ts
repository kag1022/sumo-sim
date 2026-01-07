import { Wrestler, Rank, BashoLog } from '../../../types';
import {
    QUOTA_OZEKI_MIN,
    QUOTA_MAKUUCHI, QUOTA_JURYO, QUOTA_MAKUSHITA, QUOTA_SANDANME, QUOTA_JONIDAN,
    BANZUKE_QUOTA
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
export const updateBanzuke = (wrestlers: Wrestler[], bashoId: string = "Recent Basho", currentYushoWinnerId: string | null = null, previousYushoWinnerId: string | null = null): Wrestler[] => {
    // Capture original ranks for history
    const originalRanks = new Map(wrestlers.map(w => [w.id, {
        rank: w.rank,
        rankNumber: w.rankNumber,
        rankSide: w.rankSide
    }]));

    // Pool all active wrestlers
    const pool = wrestlers.map(w => ({ ...w }));

    // Lists for Fixed Status (Y/O)
    const nextYokozuna: Wrestler[] = [];
    let nextOzeki: Wrestler[] = [];
    let candidates: Wrestler[] = [];

    // --- Phase 1: Status Maintenance (Step A) ---
    pool.forEach(w => {
        const { wins } = w.currentBashoStats;

        // A. YOKOZUNA
        if (w.rank === 'Yokozuna') {
            nextYokozuna.push(w);
            return;
        }

        // B. OZEKI
        if (w.rank === 'Ozeki') {
            if (wins >= 8) {
                // Kachi-koshi: Stay Ozeki, Clear Kadoban
                w.isKadoban = false;
                nextOzeki.push(w);
            } else {
                // Make-koshi
                if (w.isKadoban) {
                    // DEMOTION: Fall to Sekiwake
                    w.isKadoban = false;
                    w.bantsukePriorRank = 'Ozeki'; // Mark for return rule
                    candidates.push(w);
                } else {
                    // NEW KADOBAN: Stay Ozeki
                    w.isKadoban = true;
                    // Ensure Kadoban persists
                    nextOzeki.push(w);
                }
            }
            return;
        }

        // C. OZEKI RETURN RULE (Sekiwake 10 wins)
        if (w.rank === 'Sekiwake' && w.bantsukePriorRank === 'Ozeki') {
            if (wins >= 10) {
                w.bantsukePriorRank = null;
                w.rank = 'Ozeki';
                w.isKadoban = false;
                nextOzeki.push(w);
                return;
            }
            // Failed return, clear flag
            w.bantsukePriorRank = null;
        }

        // Reset Prior Rank if not used
        if (w.rank !== 'Sekiwake') w.bantsukePriorRank = null;

        // D. OTHERS
        candidates.push(w);
    });

    // --- Phase 2: Yokozuna Promotion (Step B) ---
    // Rule: Two consecutive championships OR equivalent (e.g. 13+ wins).
    // Must be Ozeki in previous basho (or newly promoted Ozeki? No, usually need to serve as Ozeki).
    // Let's stick to: Previous Rank Ozeki.

    // Check remaining Ozekis for promotion
    const promotedToYokozuna: Wrestler[] = [];
    nextOzeki = nextOzeki.filter(w => {
        // Condition: Two consecutive championships OR equivalent (e.g. 13+ wins under Ozeki/Sekiwake context).
        // Since we are checking Ozeki promotion, they are ALREADY Ozeki in current basho (filtered by w.rank === 'Ozeki').
        // We require previous basho to be Ozeki too? Or "Champion in Sekiwake" -> "Champion in Ozeki" = Promotion?
        // Standard rule: 2 consecutive Yusho as Ozeki.

        const lastBasho = w.history[w.history.length - 1];

        // If no history, cannot determine previous rank/performance
        if (!lastBasho) return true;

        const isCurrentYusho = w.id === currentYushoWinnerId;
        const isPrevYusho = w.id === previousYushoWinnerId;

        // logic:
        // Case 1: 13+ wins + 13+ wins (Legacy/Strict)
        // Case 2: Yusho + Yusho (User request)
        // Case 3: Yusho + 13 wins or 13 wins + Yusho

        const currentHigh = w.currentBashoStats.wins >= 13;
        const prevHigh = lastBasho.wins >= 13;

        const currentOk = isCurrentYusho || currentHigh;
        const prevOk = isPrevYusho || prevHigh;

        // Must have been Ozeki previously too?
        // "Ozeki rank for 2 bashos"
        const rankOk = lastBasho.rank === 'Ozeki';



        if (currentOk && prevOk && rankOk) {
            w.rank = 'Yokozuna';
            w.isKadoban = false;
            nextYokozuna.push(w);
            promotedToYokozuna.push(w);
            return false; // Remove from nextOzeki
        }
        // Special Rescue: If Yokozuna < 1, promote best Ozeki? (Optional, skipping for strictness unless requested)
        return true; // Keep in Ozeki
    });

    // --- Phase 2.5: Ozeki Promotion ---
    // Rule: Recent 3 basho at Sanyaku (Sekiwake/Komusubi) with 33+ wins.
    // We iterate 'candidates' (Non-Y/O) and check history.

    const promotedToOzeki: Wrestler[] = [];
    candidates = candidates.filter(w => {
        const last1 = w.history[w.history.length - 1];
        const last2 = w.history[w.history.length - 2];

        // Need at least 2 history records (+ current basho makes 3)
        if (!last1 || !last2) return true;

        const isSanyaku = (r: string) => ['Sekiwake', 'Komusubi'].includes(r);

        const r0 = w.rank; // Current Pre-update Rank (should be S or K)
        const r1 = last1.rank;
        const r2 = last2.rank;

        // Must be Sanyaku in all 3 basho?
        // User: "直近3場所で三役（関脇・小結）の地位にあり" -> Yes.
        if (!isSanyaku(r0) || !isSanyaku(r1) || !isSanyaku(r2)) return true;

        const wins0 = w.currentBashoStats.wins;
        const wins1 = last1.wins;
        const wins2 = last2.wins;
        const totalWins = wins0 + wins1 + wins2;

        if (totalWins >= 33) {
            w.rank = 'Ozeki';
            w.isKadoban = false;
            nextOzeki.push(w);
            promotedToOzeki.push(w);
            return false; // Remove from candidates
        }
        return true;
    });

    // --- Phase 3: Calculate Scores for Candidates ---
    candidates = candidates.map(w => {
        let score = calculateDraftScore(w);

        // Adjust for Demoted Ozeki (Soft landing at Sekiwake)
        // Ensure they have high score to take Sekiwake slot.
        if (w.bantsukePriorRank === 'Ozeki' && w.rank === 'Ozeki') {
            // They just fell.
            score = BASE_SCORE_SEKIWAKE + 2000; // Force top of Sekiwake
        }
        return { ...w, _tempScore: score };
    });

    // Sort Candidates
    candidates.sort((a: any, b: any) => b._tempScore - a._tempScore);

    // --- Phase 4: Fill Quota (Step C) ---

    // 4a. Ozeki Filling (Min 2)
    // If < 2, promote from candidates (Sekiwake usually)
    // Condition: "Recent 3 basho 33 wins" approx -> Current 11 wins?
    while (nextOzeki.length < QUOTA_OZEKI_MIN) {
        // Find best candidate with good record? 
        // For simplicity: Best Score candidate (likely Sw/Ko with high wins)
        const c = candidates.shift();
        if (!c) break;
        c.rank = 'Ozeki';
        c.isKadoban = false;
        c.bantsukePriorRank = null;
        nextOzeki.push(c);
    }

    const nextSekiwake: Wrestler[] = [];
    const nextKomusubi: Wrestler[] = [];
    const nextMaegashira: Wrestler[] = [];
    const nextJuryo: Wrestler[] = [];
    const nextMakushita: Wrestler[] = [];
    const nextSandanme: Wrestler[] = [];
    const nextJonidan: Wrestler[] = [];
    const nextJonokuchi: Wrestler[] = [];

    // Helper: Calculate how many Sekiwake slots to use
    const calculateSekiwakeSlots = (): number => {
        // Start with minimum
        let slots = BANZUKE_QUOTA.Sekiwake_Min;

        // Check for exceptional performers
        for (const c of candidates) {
            if (slots >= BANZUKE_QUOTA.Sekiwake_Max) break;

            const wins = c.currentBashoStats.wins;
            const rank = c.rank;

            // 小結で11勝以上 → 関脇昇進
            if (rank === 'Komusubi' && wins >= 11) {
                slots++;
            }
            // 前頭筆頭付近（M1-M3）で12勝以上 → 関脇昇進
            else if (rank === 'Maegashira' && (c.rankNumber || 99) <= 3 && wins >= 12) {
                slots++;
            }
        }

        return Math.min(slots, BANZUKE_QUOTA.Sekiwake_Max);
    };

    // Helper: Calculate how many Komusubi slots to use
    const calculateKomusubiSlots = (remainingMakuuchiSlots: number): number => {
        let slots = BANZUKE_QUOTA.Komusubi_Min;

        // Check for strong Maegashira who should be promoted
        for (const c of candidates) {
            if (slots >= BANZUKE_QUOTA.Komusubi_Max) break;
            if (slots >= remainingMakuuchiSlots) break;

            const wins = c.currentBashoStats.wins;
            const rank = c.rank;

            // 前頭で8勝以上 → 小結昇進候補
            if (rank === 'Maegashira' && wins >= 8) {
                slots++;
            }
        }

        return Math.min(slots, BANZUKE_QUOTA.Komusubi_Max);
    };

    // Helper: Fill List from Candidates with Side Assignment
    const fillListAndAssign = (targetList: Wrestler[], count: number, rankName: Rank, sekitori: boolean) => {
        for (let i = 0; i < count; i++) {
            const w = candidates.shift();
            if (!w) break;

            w.rank = rankName;
            w.isSekitori = sekitori;
            targetList.push(w);
        }
    };

    // --- Flexible Sanyaku Allocation ---
    const sekiwakeSlots = calculateSekiwakeSlots();
    fillListAndAssign(nextSekiwake, sekiwakeSlots, 'Sekiwake', true);

    const usedSoFar = nextYokozuna.length + nextOzeki.length + nextSekiwake.length;
    const remainingForKomusubiAndBelow = QUOTA_MAKUUCHI - usedSoFar;

    const komusubiSlots = calculateKomusubiSlots(remainingForKomusubiAndBelow);
    fillListAndAssign(nextKomusubi, komusubiSlots, 'Komusubi', true);

    const usedMakuuchi = nextYokozuna.length + nextOzeki.length + nextSekiwake.length + nextKomusubi.length;
    fillListAndAssign(nextMaegashira, Math.max(0, QUOTA_MAKUUCHI - usedMakuuchi), 'Maegashira', true);

    fillListAndAssign(nextJuryo, QUOTA_JURYO, 'Juryo', true);
    fillListAndAssign(nextMakushita, QUOTA_MAKUSHITA, 'Makushita', false);
    fillListAndAssign(nextSandanme, QUOTA_SANDANME, 'Sandanme', false);
    fillListAndAssign(nextJonidan, QUOTA_JONIDAN, 'Jonidan', false);
    fillListAndAssign(nextJonokuchi, candidates.length, 'Jonokuchi', false); // Rest


    // --- Phase 5: Assign East/West Strictly (Step D) ---
    const assignRows = (list: Wrestler[]) => {
        list.forEach((w, i) => {
            // 0=East, 1=West, 2=East, 3=West
            w.rankSide = (i % 2 === 0) ? 'East' : 'West';
            // 0,1 -> 1, 2,3 -> 2
            w.rankNumber = Math.floor(i / 2) + 1;
        });
    };

    // We must sort Fixed lists (Yokozuna/Ozeki) too! They were pushed in arrival order (random).
    // Yokozuna sorting: By History? By Wins?
    // Generally: East Yokozuna > West Yokozuna.
    // If multiple, sort by 'status' or wins.
    // Let's sort by current basho wins (Winner gets East).
    const sortForAssignment = (list: Wrestler[]) => {
        list.sort((a, b) => {
            // 1. Wins (Higher is better)
            if (a.currentBashoStats.wins !== b.currentBashoStats.wins)
                return b.currentBashoStats.wins - a.currentBashoStats.wins;
            // 2. Previous Rank Value (Higher is better)
            // Use getBaseScore(a.rank) ? No, rank is same.
            // Use previous rank/side?
            // Use 'id' for stability
            return a.id.localeCompare(b.id);
        });
    };

    sortForAssignment(nextYokozuna);
    assignRows(nextYokozuna);

    sortForAssignment(nextOzeki);
    assignRows(nextOzeki);

    // Candidates were already sorted by Score, so just assign.
    assignRows(nextSekiwake);
    assignRows(nextKomusubi);
    assignRows(nextMaegashira);
    assignRows(nextJuryo);
    assignRows(nextMakushita);
    assignRows(nextSandanme);
    assignRows(nextJonidan);
    assignRows(nextJonokuchi);

    // --- Recombine ---
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

    // Log History
    return finalRoster.map(w => {
        const orig = originalRanks.get(w.id);
        // Persist isKadoban is already in 'w' object (modified in place/step A).
        // BUT we need to make sure we return the 'w' that has it.
        // finalRoster elements are from 'pool', which are shallow copies of 'wrestlers'.
        // We modified 'w.isKadoban' on the pool objects.
        // So simply returning them works.

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
