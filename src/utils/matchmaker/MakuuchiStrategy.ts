import { Wrestler, Matchup } from '../../types';
import { IMatchmakingStrategy } from './types';
import { getRankValue } from '../constants';

export class MakuuchiStrategy implements IMatchmakingStrategy {
    generate(wrestlers: Wrestler[], day: number): Matchup[] {
        // Makuuchi Logic
        const candidates = wrestlers.filter(w => w.injuryStatus !== 'injured');
        const matchups: Matchup[] = [];
        const usedIds = new Set<string>();

        // Sort by Rank mainly
        candidates.sort((a, b) => {
            const rA = getRankValue(a.rank);
            const rB = getRankValue(b.rank);
            if (rA !== rB) return rB - rA;
            if ((a.rankNumber || 999) !== (b.rankNumber || 999)) return (a.rankNumber || 999) - (b.rankNumber || 999);
            return 0;
        });

        // Special Phase Logic
        const isEarly = day <= 2;
        const isLate = day >= 13;
        const isSenshuraku = day === 15;

        // Senshuraku Special: The Final Bout (Musubi-no-ichiban)
        // We want the highest rankers to fight LAST.
        // We will remove them from the general pool and add them manually at the end.

        // Strategy:
        // 1. If Senshuraku, reserve Top 2 remaining not matched?
        // Actually, simple way: Sort by Rank, pick Top 2 valid opponents, reserve them.

        let reservedMatchup: Matchup | null = null;
        if (isSenshuraku) {
            // Find Top 2 Highest Ranks who can fight
            // Candidates are already sorted by Rank
            for (let i = 0; i < candidates.length; i++) {
                const w1 = candidates[i];
                if (usedIds.has(w1.id)) continue;

                for (let j = i + 1; j < candidates.length; j++) {
                    const w2 = candidates[j];
                    if (usedIds.has(w2.id)) continue;
                    if (w1.heyaId === w2.heyaId) continue;
                    // For Musubi-no-ichiban, we ideally ignore history if it's the defining match?
                    // But generally in Sumo they fight once. If they fought, it's done. 
                    // Exception: Playoff (not handled here).
                    if (w1.currentBashoStats.matchHistory.includes(w2.id)) continue;

                    // Found valid top pair
                    reservedMatchup = {
                        east: w1,
                        west: w2,
                        winnerId: null,
                        division: 'Makuuchi'
                    };
                    usedIds.add(w1.id);
                    usedIds.add(w2.id);
                    break;
                }
                if (reservedMatchup) break;
            }
        }

        // --- General Matching Loop ---
        // Reuse similar logic but with different prioritization

        // If Late Basho, we resort candidates based on Wins primarily (Winner vs Winner)
        // BUT for Makuuchi, we still respect rank heavily (Sanyaku vs Sanyaku).
        // Let's use a hybrid sort for Late: Wins * 1000 + RankValue?

        let pool = [...candidates];
        if (isLate) {
            // Re-Sort pool exclude used
            pool = pool.filter(w => !usedIds.has(w.id));
            pool.sort((a, b) => {
                if (b.currentBashoStats.wins !== a.currentBashoStats.wins) return b.currentBashoStats.wins - a.currentBashoStats.wins;
                const rA = getRankValue(a.rank);
                const rB = getRankValue(b.rank);
                return rB - rA;
            });
        }

        for (let i = 0; i < pool.length; i++) {
            const w1 = pool[i];
            if (usedIds.has(w1.id)) continue;

            let bestOp: Wrestler | null = null;

            // Early Basho Logic: Top Rankers vs Maegashira Upper
            // Yokozuna vs M1, M2...
            // Logic: If w1 is Sanyaku, try to find Maegashira 1-5?
            // Actually rank-sorted list does this naturally if we skip nearby Sanyaku?
            // "Fixed combinations": Y vs K usually.
            // Simplified: Just search down the list.

            // Search Loop
            for (let j = i + 1; j < pool.length; j++) {
                const w2 = pool[j];
                if (usedIds.has(w2.id)) continue;
                if (w1.heyaId === w2.heyaId) continue;
                if (w1.currentBashoStats.matchHistory.includes(w2.id)) continue;

                // Early Days Constraint:
                // Yokozuna/Ozeki (RankVal >= 80?) should NOT fight Yokozuna/Ozeki
                // unless only they are left.
                if (isEarly) {
                    const r1 = getRankValue(w1.rank);
                    const r2 = getRankValue(w2.rank);
                    const isTop1 = r1 >= 80;
                    const isTop2 = r2 >= 80;

                    if (isTop1 && isTop2) continue; // Skip Sanyaku vs Sanyaku in early days
                }

                bestOp = w2;
                break;
            }

            if (bestOp) {
                usedIds.add(w1.id);
                usedIds.add(bestOp.id);
                matchups.push({
                    east: w1,
                    west: bestOp,
                    winnerId: null,
                    division: 'Makuuchi'
                });
            }
        }

        // --- Phase 2: Rescue Matching (Relaxed) ---
        // For leftovers, allow Rematches (History Ignored). 
        // Still avoid Same Heya if possible.

        // Re-scan remaining pool
        let leftovers = pool.filter(w => !usedIds.has(w.id));

        if (leftovers.length > 0) {
            for (let i = 0; i < leftovers.length; i++) {
                const w1 = leftovers[i];
                if (usedIds.has(w1.id)) continue;

                let bestOp: Wrestler | null = null;

                // Sub-Phase 2A: No Same Heya, But Rematch OK.
                for (let j = i + 1; j < leftovers.length; j++) {
                    const w2 = leftovers[j];
                    if (usedIds.has(w2.id)) continue;
                    if (w1.heyaId === w2.heyaId) continue; // Still respect heya
                    // Ignore history check
                    bestOp = w2;
                    break;
                }

                // Sub-Phase 2B: Emergency (Allow Same Heya)
                // If 2A failed, just grab anyone.
                if (!bestOp) {
                    for (let j = i + 1; j < leftovers.length; j++) {
                        const w2 = leftovers[j];
                        if (usedIds.has(w2.id)) continue;
                        bestOp = w2; // Anything goes
                        break;
                    }
                }

                if (bestOp) {
                    usedIds.add(w1.id);
                    usedIds.add(bestOp.id);
                    matchups.push({
                        east: w1,
                        west: bestOp,
                        winnerId: null,
                        division: 'Makuuchi'
                    });
                }
            }
        }

        // Add Reserved Matchup at the End
        if (reservedMatchup) {
            matchups.push(reservedMatchup);
        }

        return matchups;
    }
}
