import { Wrestler, Matchup, Division } from '../../../../types';
import { IMatchmakingStrategy } from './types';
import { getRankValue } from '../../../../utils/constants';

export class MakushitaStrategy implements IMatchmakingStrategy {
    private division: Division;

    constructor(division: Division) {
        this.division = division;
    }

    generate(wrestlers: Wrestler[], day: number): Matchup[] {
        // Makushita and below wrestle 7 times in 15 days.
        // Schedule Plan:
        // Day 1: Rank Based
        // Day 2: Rank Based (Remaining)
        // Day 3+: Swiss System (Score Based)

        // We need to determine who fights today.
        // Target: Roughly 50% of the division per day.

        // 1. Identify Valid Candidates
        // - Not Injured
        // - nextBoutDay is Today OR null (if not scheduled yet)
        // - Has played < 7 matches

        const candidates = wrestlers.filter(w => {
            if (w.injuryStatus === 'injured') return false;
            if (w.currentBashoStats.wins + w.currentBashoStats.losses >= 7) return false;
            if (w.nextBoutDay !== null && w.nextBoutDay > day) return false;
            return true;
        });

        // 2. Sort Candidates
        // Priority 1: Fewest Matches Played (Prevent Starvation)
        // Priority 2: Rank
        candidates.sort((a, b) => {
            const matchesA = a.currentBashoStats.wins + a.currentBashoStats.losses;
            const matchesB = b.currentBashoStats.wins + b.currentBashoStats.losses;
            if (matchesA !== matchesB) return matchesA - matchesB; // Ascending Match Count

            const rA = getRankValue(a.rank);
            const rB = getRankValue(b.rank);
            if (rA !== rB) return rB - rA; // Descending Rank Value
            if ((a.rankNumber || 999) !== (b.rankNumber || 999)) return (a.rankNumber || 999) - (b.rankNumber || 999);
            return 0;
        });

        const matchups: Matchup[] = [];
        const usedIds = new Set<string>();

        // 3. Pairing Logic
        // For Days 1-2, Strict Rank Pairing.
        // For Days 3+, Score Grouping (Swiss).

        const isEarlyBasho = day <= 2;

        if (isEarlyBasho) {
            // Simple Rank Pairing
            for (let i = 0; i < candidates.length; i++) {
                const w1 = candidates[i];
                if (usedIds.has(w1.id)) continue;

                // Find opponent
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
                        division: this.division
                    });
                }
            }
        } else {
            // Swiss System (Score Groups)
            // Group by Wins
            const groups: Record<number, Wrestler[]> = {};
            candidates.forEach(w => {
                if (usedIds.has(w.id)) return;
                const wins = w.currentBashoStats.wins;
                if (!groups[wins]) groups[wins] = [];
                groups[wins].push(w);
            });

            // Iterate from highest wins to lowest
            const winKeys = Object.keys(groups).map(Number).sort((a, b) => b - a);

            let carryOver: Wrestler[] = [];

            for (const wins of winKeys) {
                let pool = [...carryOver, ...groups[wins]];
                carryOver = [];

                // Sort pool by Rank
                pool.sort((a, b) => {
                    const rA = getRankValue(a.rank);
                    const rB = getRankValue(b.rank);
                    return rB - rA;
                });

                while (pool.length > 1) {
                    const w1 = pool.shift()!;

                    // Find Opponent in pool
                    let foundIndex = -1;
                    for (let k = 0; k < pool.length; k++) {
                        const w2 = pool[k];
                        if (w1.heyaId !== w2.heyaId && !w1.currentBashoStats.matchHistory.includes(w2.id)) {
                            foundIndex = k;
                            break;
                        }
                    }

                    if (foundIndex !== -1) {
                        const w2 = pool.splice(foundIndex, 1)[0];
                        usedIds.add(w1.id);
                        usedIds.add(w2.id);
                        matchups.push({
                            east: w1,
                            west: w2,
                            winnerId: null,
                            division: this.division
                        });
                    } else {
                        // No opponent found in peer group (due to constraints), push to carryOver to fight lower score?
                        // Or just skip for today.
                        // Let's try to match with lower score group (carryOver).
                        carryOver.push(w1);
                    }
                }

                if (pool.length === 1) {
                    carryOver.push(pool[0]);
                }
            }
        }

        return matchups;
    }
}

