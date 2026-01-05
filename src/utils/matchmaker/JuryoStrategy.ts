import { Wrestler, Matchup } from '../../types';
import { IMatchmakingStrategy } from './types';
import { getRankValue } from '../constants';

export class JuryoStrategy implements IMatchmakingStrategy {
    generate(wrestlers: Wrestler[], day: number): Matchup[] {
        // Juryo: Matches Every Day. Same number of wrestlers usually (unless substitution).

        // Exclude injured or already matched (if any anomaly)
        const candidates = wrestlers.filter(w => w.injuryStatus !== 'injured');

        // Initial Sort: Rank
        candidates.sort((a, b) => {
            const rA = getRankValue(a.rank);
            const rB = getRankValue(b.rank);
            if (rA !== rB) return rB - rA;
            if ((a.rankNumber || 999) !== (b.rankNumber || 999)) return (a.rankNumber || 999) - (b.rankNumber || 999);
            return 0;
        });

        const matchups: Matchup[] = [];
        const usedIds = new Set<string>();

        // Logic Switch
        // Day 1-9: Rank Based (Neighborhood)
        // Day 10-15: Score Based (Winner vs Winner)
        const isLateBasho = day >= 10;

        if (!isLateBasho) {
            // Early Basho: Rank Based
            for (let i = 0; i < candidates.length; i++) {
                if (usedIds.has(candidates[i].id)) continue;
                const w1 = candidates[i];

                // Search for nearest rank opponent
                // We iterate j from i+1.
                let bestOp: Wrestler | null = null;

                for (let j = i + 1; j < candidates.length; j++) {
                    const w2 = candidates[j];
                    if (usedIds.has(w2.id)) continue;
                    if (w1.heyaId === w2.heyaId) continue;
                    if (w1.currentBashoStats.matchHistory.includes(w2.id)) continue;

                    // Simple logic: First available neighbor is often the best rank match
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
                        division: 'Juryo'
                    });
                }
            }
        } else {
            // Late Basho: Score Based
            // Sort by Wins Desc, then Rank
            candidates.sort((a, b) => {
                if (b.currentBashoStats.wins !== a.currentBashoStats.wins) return b.currentBashoStats.wins - a.currentBashoStats.wins;
                const rA = getRankValue(a.rank);
                const rB = getRankValue(b.rank);
                return rB - rA;
            });

            for (let i = 0; i < candidates.length; i++) {
                if (usedIds.has(candidates[i].id)) continue;
                const w1 = candidates[i];
                let bestOp: Wrestler | null = null;

                for (let j = i + 1; j < candidates.length; j++) {
                    const w2 = candidates[j];
                    if (usedIds.has(w2.id)) continue;
                    if (w1.heyaId === w2.heyaId) continue;
                    if (w1.currentBashoStats.matchHistory.includes(w2.id)) continue;

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
                        division: 'Juryo'
                    });
                }
            }
        }

        // --- Phase 2: Rescue Matching (Relaxed) ---
        // Reuse fallback logic for Juryo as well.
        let leftovers = candidates.filter(w => !usedIds.has(w.id));

        if (leftovers.length > 0) {
            for (let i = 0; i < leftovers.length; i++) {
                const w1 = leftovers[i];
                if (usedIds.has(w1.id)) continue;

                let bestOp: Wrestler | null = null;

                // Sub-Phase 2A: No Same Heya, But Rematch OK.
                for (let j = i + 1; j < leftovers.length; j++) {
                    const w2 = leftovers[j];
                    if (usedIds.has(w2.id)) continue;
                    if (w1.heyaId === w2.heyaId) continue;
                    bestOp = w2;
                    break;
                }

                // Sub-Phase 2B: Emergency (Allow Same Heya)
                if (!bestOp) {
                    for (let j = i + 1; j < leftovers.length; j++) {
                        const w2 = leftovers[j];
                        if (usedIds.has(w2.id)) continue;
                        bestOp = w2;
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
                        division: 'Juryo'
                    });
                }
            }
        }

        return matchups;
    }
}
