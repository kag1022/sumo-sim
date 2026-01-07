import { describe, it, expect } from 'vitest';
import { updateBanzuke } from './banzuke';
import { Wrestler, Rank, WrestlerStats, BashoLog } from '../../../types';

// Mock Helper
const createMockWrestler = (
    id: string,
    rank: Rank,
    wins: number,
    rankNum: number = 1,
    rankSide: 'East' | 'West' = 'East',
    isKadoban: boolean = false,
    history: BashoLog[] = [],
    stats: WrestlerStats = { body: 50, technique: 50, mind: 50 }
): Wrestler => ({
    id,
    name: `Wrestler-${id}`,
    heyaId: 'heya1',
    rank,
    rankNumber: rankNum,
    rankSide,
    isKadoban,
    stats,
    isSekitori: true,
    injuryStatus: 'healthy',
    history,
    currentBashoStats: { wins, losses: 15 - wins, matchHistory: [] },
    // Dummy fields
    age: 20,
    maxRank: rank,
    historyMaxLength: 100,
    timeInHeya: 12,
    injuryDuration: 0,
    consecutiveLoseOrAbsent: 0,
    stress: 0,
    nextBoutDay: null,
    potential: 80,
    flexibility: 50,
    weight: 150,
    height: 180,
    background: 'Test',
    skills: [],
    retirementStatus: 'None'
});

describe('Banzuke Logic', () => {

    // Test Case A: Yokozuna Promotion
    it('should promote Ozeki to Yokozuna with 2 consecutive Yusho (Case A)', () => {
        // History: Previous Basho was Yusho (Winner)
        // We simulate this by passing previousYushoWinnerId
        const w1 = createMockWrestler('w1', 'Ozeki', 13, 1, 'East', false, [
            { bashoId: 'prev', rank: 'Ozeki', rankNumber: 1, rankSide: 'East', wins: 14, losses: 1 }
        ]);

        // Current Basho: Won (e.g. 13 wins, or even 12 if Yusho)
        // We simulate checking "Yusho" by passing IDs to updateBanzuke

        const result = updateBanzuke(
            [w1],
            'current',
            'w1', // Current Yusho
            'w1'  // Previous Yusho
        );

        expect(result[0].rank).toBe('Yokozuna');
        expect(result[0].history).toHaveLength(2); // +1 new log
    });

    // Test Case B: Ozeki Kadoban
    it('should handle Ozeki Kadoban status correctly (Case B)', () => {
        // Case 1: Make-koshi (7-8) -> New Kadoban
        const w1 = createMockWrestler('w1', 'Ozeki', 7);
        // Case 2: Kadoban + Make-koshi -> Demotion
        const w2 = createMockWrestler('w2', 'Ozeki', 7, 1, 'West', true);
        // Case 3: Kadoban + Kachi-koshi -> Clear Kadoban
        const w3 = createMockWrestler('w3', 'Ozeki', 8, 2, 'East', true);

        const result = updateBanzuke([w1, w2, w3]);

        // Verify w1 (New Kadoban)
        const r1 = result.find(w => w.id === 'w1');
        expect(r1?.rank).toBe('Ozeki');
        expect(r1?.isKadoban).toBe(true);

        // Verify w2 (Demotion)
        const r2 = result.find(w => w.id === 'w2');
        expect(r2?.rank).toBe('Sekiwake');
        expect(r2?.isKadoban).toBe(false);
        expect(r2?.bantsukePriorRank).toBe('Ozeki'); // Marked for return

        // Verify w3 (Clear)
        const r3 = result.find(w => w.id === 'w3');
        expect(r3?.rank).toBe('Ozeki');
        expect(r3?.isKadoban).toBe(false);
    });

    // Test Case C: East/West Sorting
    it('should assign East/West correctly based on score/wins (Case C)', () => {
        // Create 4 Maegashira with different wins to test sorting
        // w1: 10 wins
        // w2: 9 wins
        // w3: 8 wins
        // w4: 7 wins
        // All start at same rank/number for simplicity, or slightly different to test "Inertia" if score logic used?
        // updateBanzuke uses `calculateDraftScore`. High wins -> High Score.
        const w1 = createMockWrestler('w1', 'Maegashira', 10, 5);
        const w2 = createMockWrestler('w2', 'Maegashira', 9, 5);
        const w3 = createMockWrestler('w3', 'Maegashira', 8, 5);
        const w4 = createMockWrestler('w4', 'Maegashira', 7, 5);

        // We need to fill quotas so they land in Maegashira.
        // updateBanzuke fills Y/O/S/K first.
        // Ensure they are not promoted to Sanyaku (unless open slots).
        // Since Y/O/S/K lists are empty in this test input, they might get promoted to Sanyaku!
        // We should add dummy Y/O/S/K to fill slots, OR verify they are sorted correctly within whatever rank they end up.
        // Actually, if we just pass these 4, they will fill Y/O/S/K slots! ('Fill the Void')

        // Let's create enough dummy wrestlers to fill Sanyaku quotas
        // Y: 0, O: 2 (Min), S: 2, K: 2. Total 6 slots.
        // Then our test subjects will be Maegashira.
        const dummies = [];
        for (let i = 0; i < 6; i++) {
            dummies.push(createMockWrestler(`d${i}`, 'Yokozuna', 15)); // Force them to stay/promote high
        }

        // Actually, updateBanzuke logic:
        // Y -> Stay Y
        // O -> Stay O
        // Candidates (incl M) -> Sorted by Score -> Fill O, S, K, M...

        // If we make dummies 'Yokozuna', they stay Yokozuna.
        // If we make dummies 'Ozeki', they stay Ozeki (if 8+ wins).
        // We need 2 Ozekis to block Ozeki slots?
        // Let's just create W1-W4 and see where they land. They will likely be promoted to Ozeki/Sekiwake/Komusubi.
        // But relative order should be preserved.
        // w1 (10) > w2 (9) > w3 (8) > w4 (7)

        const result = updateBanzuke([w1, w2, w3, w4]);

        // Sort result by ID isn't enough, we need to find them.
        const r1 = result.find(w => w.id === 'w1');
        const r2 = result.find(w => w.id === 'w2');
        const r3 = result.find(w => w.id === 'w3');
        const r4 = result.find(w => w.id === 'w4');

        // Check relative order by Rank Value (Y=100, O=90...) or just check printed rank
        // w1 should be highest.
        // They will likely fill Ozeki (2), Sekiwake (2).

        // w1: Ozeki East (Top)
        // w2: Ozeki West (2nd)
        // w3: Sekiwake East (3rd)
        // w4: Sekiwake West (4th)

        expect(r1?.rank).toBe('Ozeki');
        expect(r1?.rankSide).toBe('East');

        expect(r2?.rank).toBe('Ozeki');
        expect(r2?.rankSide).toBe('West');

        expect(r3?.rank).toBe('Sekiwake');
        expect(r3?.rankSide).toBe('East');

        expect(r4?.rank).toBe('Sekiwake');
        expect(r4?.rankSide).toBe('West');
    });

    // Test Case: Ozeki Promotion Logic (33 Wins Rule)
    it('should promote to Ozeki with 33 wins in 3 Sanyaku bashos', () => {
        const w = createMockWrestler('w1', 'Sekiwake', 11, 1, 'East', false, [
            { bashoId: 'b1', rank: 'Sekiwake', wins: 11, losses: 4, rankNumber: 1, rankSide: 'East' },
            { bashoId: 'b2', rank: 'Komusubi', wins: 11, losses: 4, rankNumber: 1, rankSide: 'East' }
        ]);
        // Total: 11 (Current) + 11 + 11 = 33. All Sanyaku.

        const result = updateBanzuke([w]);
        expect(result[0].rank).toBe('Ozeki');
    });

});
