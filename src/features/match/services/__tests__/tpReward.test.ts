import { describe, it, expect } from 'vitest';
import { processDailyMatches } from '../matchService';
import { Wrestler, Matchup } from '../../../../types';
import { TP_REWARD_WIN } from '../../../../utils/constants';

// Mock minimal Wrestler
const createMockWrestler = (id: string, heyaId: string, name: string): Wrestler => ({
    id,
    heyaId,
    name,
    rank: 'Maegashira',
    rankSide: 'East',
    rankNumber: 1,
    stats: { mind: 50, technique: 50, body: 50 },
    currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
    history: [],
    isSekitori: true,
    injuryStatus: 'healthy',
    potential: 100,
    flexibility: 50,
    weight: 150,
    height: 180,
    background: 'test',
    age: 20,
    maxRank: 'Maegashira',
    historyMaxLength: 0,
    timeInHeya: 0,
    injuryDuration: 0,
    consecutiveLoseOrAbsent: 0,
    stress: 0,
    skills: [],
    reading: 'Test Reading',
    nextBoutDay: null,
    origin: 'Test Origin',
    retirementStatus: 'None'
});

describe('TP System Verification', () => {
    it('should award TP when player wrestler wins', () => {
        const player = createMockWrestler('p1', 'player_heya', 'Player');
        const cpu = createMockWrestler('c1', 'cpu_heya', 'CPU');

        const matches: Matchup[] = [{
            east: player,
            west: cpu,
            division: 'Makuuchi',
            winnerId: null
        }];

        // Mock Math.random to always return 0 (East wins)
        const originalRandom = Math.random;
        Math.random = () => 0; // < winChance

        const result = processDailyMatches([player, cpu], matches, new Date(), 1);

        expect(result.tpChange).toBe(TP_REWARD_WIN);

        Math.random = originalRandom;
    });

    it('should NOT award TP when player wrestler loses', () => {
        const player = createMockWrestler('p1', 'player_heya', 'Player');
        const cpu = createMockWrestler('c1', 'cpu_heya', 'CPU');

        const matches: Matchup[] = [{
            east: player,
            west: cpu,
            division: 'Makuuchi',
            winnerId: null
        }];

        // Mock Math.random to always return 0.99 (East loses)
        const originalRandom = Math.random;
        Math.random = () => 0.99;

        const result = processDailyMatches([player, cpu], matches, new Date(), 1);

        expect(result.tpChange).toBe(0);

        Math.random = originalRandom;
    });

    it('should award TP when player wrestler is West and wins', () => {
        const player = createMockWrestler('p1', 'player_heya', 'Player');
        const cpu = createMockWrestler('c1', 'cpu_heya', 'CPU');

        const matches: Matchup[] = [{
            east: cpu,
            west: player, // Player is West
            division: 'Makuuchi',
            winnerId: null
        }];

        // Mock Math.random to always return 0.99 (East Loses -> West Wins)
        const originalRandom = Math.random;
        Math.random = () => 0.99;

        const result = processDailyMatches([player, cpu], matches, new Date(), 1);

        expect(result.tpChange).toBe(TP_REWARD_WIN);

        Math.random = originalRandom;
    });

    it('should NOT award TP for Makushita win if probability check fails', () => {
        const player = createMockWrestler('p1', 'player_heya', 'Player');
        player.rank = 'Makushita'; // Lower rank
        const cpu = createMockWrestler('c1', 'cpu_heya', 'CPU');

        const matches: Matchup[] = [{
            east: player,
            west: cpu,
            division: 'Makushita',
            winnerId: null
        }];

        const originalRandom = Math.random;
        // First random is for win check (0 -> East wins)
        // Second random is for TP check (0.4 > 0.3 -> No TP)
        let callCount = 0;
        Math.random = () => {
            callCount++;
            if (callCount === 1) return 0; // Win
            return 0.4; // Fail TP check
        };

        const result = processDailyMatches([player, cpu], matches, new Date(), 1);

        expect(result.tpChange).toBe(0);

        Math.random = originalRandom;
    });

    it('should award TP for Makushita win if probability check passes', () => {
        const player = createMockWrestler('p1', 'player_heya', 'Player');
        player.rank = 'Makushita'; // Lower rank
        const cpu = createMockWrestler('c1', 'cpu_heya', 'CPU');

        const matches: Matchup[] = [{
            east: player,
            west: cpu,
            division: 'Makushita',
            winnerId: null
        }];

        const originalRandom = Math.random;
        // First random is for win check (0 -> East wins)
        // Second random is for TP check (0.2 < 0.3 -> Get TP)
        let callCount = 0;
        Math.random = () => {
            callCount++;
            if (callCount === 1) return 0; // Win
            return 0.2; // Pass TP check
        };

        const result = processDailyMatches([player, cpu], matches, new Date(), 1);

        expect(result.tpChange).toBe(TP_REWARD_WIN);

        Math.random = originalRandom;
    });
});
