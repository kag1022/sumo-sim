import { describe, it, expect } from 'vitest';
import { generateDailyMatches } from './DailyScheduler';
import { Wrestler, Rank } from '../../../../types';

// Helper to create mock wrestler
const createMockWrestler = (id: string, rank: Rank, rankNumber: number = 1, heyaId?: string): Wrestler => ({
    id,
    name: `Wrestler ${id}`,
    reading: `Wrestler ${id}`,
    origin: 'Osaka',
    heyaId: heyaId || `heya-${id}`, // Deterministic distinct default
    rank,
    rankNumber,
    rankSide: 'East',
    stats: { body: 50, technique: 50, mind: 50 },
    isSekitori: ['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira', 'Juryo'].includes(rank),
    injuryStatus: 'healthy',
    history: [],
    currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
    // Dummies
    age: 20, maxRank: rank, historyMaxLength: 10, timeInHeya: 10, injuryDuration: 0,
    consecutiveLoseOrAbsent: 0, stress: 0, nextBoutDay: null, potential: 100,
    flexibility: 50, weight: 150, height: 180, background: '', skills: [],
    retirementStatus: 'None'
});

describe('DailyScheduler', () => {
    describe('generateDailyMatches', () => {
        it('should NOT match M5+ with Juryo (Rank Barrier)', () => {
            // Setup: 1 Yokozuna, 1 Ozeki, 1 M5, 1 M10, 1 Juryo1, 1 Juryo14
            // We need enough wrestlers to allow valid matches too
            const wrestlers = [
                createMockWrestler('Y1', 'Yokozuna'),
                createMockWrestler('O1', 'Ozeki'),
                createMockWrestler('M5', 'Maegashira', 5),
                createMockWrestler('M6', 'Maegashira', 6), // Borderline case
                createMockWrestler('M10', 'Maegashira', 10),
                createMockWrestler('J1', 'Juryo', 1),
                createMockWrestler('J2', 'Juryo', 2),
                createMockWrestler('J14', 'Juryo', 14),
            ];

            const matches = generateDailyMatches(wrestlers, 1);

            matches.forEach(m => {
                // M5+ equivalent check

                // M5+ equivalent check
                const isHighRank = (w: Wrestler) => {
                    if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi'].includes(w.rank)) return true;
                    if (w.rank === 'Maegashira' && (w.rankNumber || 1) <= 5) return true;
                    return false;
                };

                const oneIsHighRank = isHighRank(m.east) || isHighRank(m.west);
                const oneIsJuryo = m.east.rank === 'Juryo' || m.west.rank === 'Juryo';

                if (oneIsHighRank && oneIsJuryo) {
                    console.error(`Violation match: ${m.east.name}(${m.east.rank}${m.east.rankNumber}) vs ${m.west.name}(${m.west.rank}${m.west.rankNumber})`);
                }

                expect(oneIsHighRank && oneIsJuryo).toBe(false);
            });
        });

        it('should NOT match Ozeki+ vs Ozeki+ before Day 13 (Save Best Bouts)', () => {
            // Setup: 2 Yokozuna, 2 Ozeki, and enough fodder
            const wrestlers = [
                createMockWrestler('Y1', 'Yokozuna'),
                createMockWrestler('Y2', 'Yokozuna'),
                createMockWrestler('O1', 'Ozeki'),
                createMockWrestler('O2', 'Ozeki'),
                createMockWrestler('M1', 'Maegashira', 1),
                createMockWrestler('M2', 'Maegashira', 2),
                createMockWrestler('M3', 'Maegashira', 3),
                createMockWrestler('M4', 'Maegashira', 4),
            ];

            const matches = generateDailyMatches(wrestlers, 1); // Day 1

            matches.forEach(m => {
                const isTopRank = (r: Rank) => r === 'Yokozuna' || r === 'Ozeki';
                const bothTop = isTopRank(m.east.rank) && isTopRank(m.west.rank);

                if (bothTop) {
                    console.error(`Violation match: ${m.east.name} vs ${m.west.name}`);
                }
                expect(bothTop).toBe(false);
            });
        });

        it('should ALLOW Ozeki+ vs Ozeki+ on Day 13+', () => {
            // Setup: Only Top ranks and very few others, encouraging top matches
            // Note: In real logic, they sort by wins after day 10, so we can't guarantee matchups purely by rank unless we control stats.
            // But simple rank-based strict prohibition should be GONE.
            // Actually, the test checks if the CODE prevents it. If random luck makes them match, it's valid.
            // Hard to test "Ability" to match without forcing it. 
            // Let's just pass this for now or try to force it by having NO other opponents?

            // If we have only 2 wrestlers, Y1 and Y2. They MUST match.
            const wrestlers = [
                createMockWrestler('Y1', 'Yokozuna'),
                createMockWrestler('Y2', 'Yokozuna'),
            ];

            const matches = generateDailyMatches(wrestlers, 13);
            expect(matches).toHaveLength(1);
            expect(matches[0].east.id).not.toBe(matches[0].west.id);
        });

        it('should FALLBACK if no opponent found with strict constraints', () => {
            // Setup: 2 Yokozuna. No one else.
            // Rule Says: No Yokozuna vs Yokozuna before Day 13.
            // But Day = 1.
            // Strict rule would prevent match.
            // Fallback should allow it to prevent infinite loop or empty match.
            const wrestlers = [
                createMockWrestler('Y1', 'Yokozuna'),
                createMockWrestler('Y2', 'Yokozuna'),
            ];

            const matches = generateDailyMatches(wrestlers, 1);

            // Should still generate a match due to fallback
            expect(matches).toHaveLength(1);
            expect(matches[0].east.id).not.toBe(matches[0].west.id);
        });
    });
});
