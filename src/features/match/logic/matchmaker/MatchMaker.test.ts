import { describe, it, expect } from 'vitest';
import { MatchMaker } from './MatchMaker'; // Assuming default or named export
import { Wrestler } from '../../../../types';

// Simplified Mock for Match
const createMockFighter = (id: string, body: number, tech: number, mind: number, rank: string = 'Maegashira'): Wrestler => ({
    id,
    name: id,
    reading: id,
    origin: 'Tokyo',
    heyaId: 'h1',
    rank: rank as any,
    rankNumber: 1,
    stats: { body, technique: tech, mind },
    isSekitori: true,
    injuryStatus: 'healthy',
    history: [],
    currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
    // Dummies
    age: 20, maxRank: 'Maegashira', historyMaxLength: 10, timeInHeya: 10, injuryDuration: 0, consecutiveLoseOrAbsent: 0, stress: 0, nextBoutDay: null, potential: 100, flexibility: 50, weight: 150, height: 180, background: '', skills: [], retirementStatus: 'None'
});

describe('MatchMaker Logic', () => {
    const matchMaker = new MatchMaker();

    // Test Case D: Attribute Advantage
    it('should give advantage to Attribute counters (Case D)', () => {
        // Body (100) vs Technique (100)
        // Body > Technique -> Body should have higher win probability than 0.5
        // Stats are equal (100 vs 100 avg).
        // Ranks equal.
        // Base probability 0.5.
        // Advantage Bonus: +15% force.

        const bodyFighter = createMockFighter('BF', 100, 50, 50); // Dom: Body
        const techFighter = createMockFighter('TF', 50, 100, 50); // Dom: Tech

        // Verify Dominant Attributes
        // BF: Body (100) vs others -> Body
        // TF: Tech (100) vs others -> Tech

        const result = matchMaker.calculateWinChance(bodyFighter, techFighter);
        const prob = result.winChance;

        // Expect > 0.5
        // Calculation trace:
        // Force A = (100+50+50)/3 = 66.6
        // Force B = 66.6
        // Advantage: A (Body) > B (Tech) -> 'East' (A)
        // Force A *= 1.15 -> 76.66
        // Total = 76.66 + 66.6 = 143.26
        // Prob = 76.66 / 143.26 ≈ 0.535

        expect(prob).toBeGreaterThan(0.51);
        console.log(`Body vs Tech Prob: ${prob}`);
    });

    it('should give advantage to Technique over Mind', () => {
        const techFighter = createMockFighter('TF', 50, 100, 50);
        const mindFighter = createMockFighter('MF', 50, 50, 100);
        const prob = matchMaker.calculateWinChance(techFighter, mindFighter).winChance;
        expect(prob).toBeGreaterThan(0.51);
    });

    it('should give advantage to Mind over Body', () => {
        const mindFighter = createMockFighter('MF', 50, 50, 100);
        const bodyFighter = createMockFighter('BF', 100, 50, 50);
        const prob = matchMaker.calculateWinChance(mindFighter, bodyFighter).winChance;
        expect(prob).toBeGreaterThan(0.51);
    });
});
