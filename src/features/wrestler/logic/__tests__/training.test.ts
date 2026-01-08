import { describe, it, expect } from 'vitest';
import { calculateSpecialTrainingResult } from '../training';
import { Wrestler } from '../../../../types';

const createMockWrestler = (): Wrestler => ({
    id: 'w1',
    heyaId: 'h1',
    name: 'Test',
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
    reading: 'Test',
    nextBoutDay: null,
    origin: 'Test',
    retirementStatus: 'None'
});

describe('Special Training Logic', () => {
    it('should increase Body and Stress for Shiko', () => {
        const wrestler = createMockWrestler();
        const result = calculateSpecialTrainingResult(wrestler, 'shiko');

        expect(result.updatedWrestler.stats.body).toBe(52); // +2
        expect(result.updatedWrestler.stress).toBe(15); // +15
    });

    it('should increase Technique and Stress for Teppo', () => {
        const wrestler = createMockWrestler();
        const result = calculateSpecialTrainingResult(wrestler, 'teppo');

        expect(result.updatedWrestler.stats.technique).toBe(52); // +2
        expect(result.updatedWrestler.stress).toBe(15); // +15
    });

    it('should increase all stats and High Stress for Moushi-ai', () => {
        const wrestler = createMockWrestler();
        const result = calculateSpecialTrainingResult(wrestler, 'moushi_ai');

        expect(result.updatedWrestler.stats.body).toBe(51); // +1
        expect(result.updatedWrestler.stats.technique).toBe(51); // +1
        expect(result.updatedWrestler.stats.mind).toBe(51); // +1
        expect(result.updatedWrestler.stress).toBe(25); // +25
    });

    it('should increase Mind but reduce Stress for Meditation', () => {
        const wrestler = createMockWrestler();
        wrestler.stress = 50;
        const result = calculateSpecialTrainingResult(wrestler, 'meditation');

        expect(result.updatedWrestler.stats.mind).toBe(52); // +2
        expect(result.updatedWrestler.stress).toBe(40); // -10
    });

    it('should cap stats at potential', () => {
        const wrestler = createMockWrestler();
        wrestler.stats.body = 100;
        wrestler.potential = 100;

        const result = calculateSpecialTrainingResult(wrestler, 'shiko');

        expect(result.updatedWrestler.stats.body).toBe(100); // capped
    });
});
