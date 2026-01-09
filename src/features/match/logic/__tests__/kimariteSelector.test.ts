import { describe, it, expect } from 'vitest';
import { determineKimarite } from '../kimariteSelector';
import { Wrestler } from '../../../../types';
import { KIMARITE_DATA } from '../../data/kimariteData';

/**
 * テスト用の力士モックを生成
 */
const createMockWrestler = (
    id: string,
    body: number,
    technique: number,
    mind: number
): Wrestler => ({
    id,
    name: id,
    reading: id,
    origin: 'Tokyo',
    heyaId: 'h1',
    rank: 'Maegashira',
    rankNumber: 1,
    stats: { body, technique, mind },
    isSekitori: true,
    injuryStatus: 'healthy',
    history: [],
    currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
    age: 25,
    maxRank: 'Maegashira',
    historyMaxLength: 10,
    timeInHeya: 12,
    injuryDuration: 0,
    consecutiveLoseOrAbsent: 0,
    stress: 0,
    nextBoutDay: null,
    potential: 50,
    flexibility: 50,
    weight: 150,
    height: 180,
    background: '',
    skills: [],
    retirementStatus: 'None',
});

describe('determineKimarite', () => {
    const loser = createMockWrestler('Loser', 50, 50, 50);

    it('should always return a non-empty string', () => {
        const winner = createMockWrestler('Winner', 80, 60, 40);

        for (let i = 0; i < 100; i++) {
            const kimarite = determineKimarite(winner, loser);
            expect(typeof kimarite).toBe('string');
            expect(kimarite.length).toBeGreaterThan(0);
        }
    });

    it('should return a valid kimarite ID from KIMARITE_DATA', () => {
        const winner = createMockWrestler('Winner', 80, 60, 40);
        const validIds = KIMARITE_DATA.map(k => k.id);

        for (let i = 0; i < 100; i++) {
            const kimarite = determineKimarite(winner, loser);
            expect(validIds).toContain(kimarite);
        }
    });

    describe('Style Distribution', () => {
        /**
         * 分布テスト: 1000回試行して特定技の出現頻度を検証
         */
        const runDistributionTest = (
            body: number,
            tech: number,
            mind: number,
            expectedHigh: string[],
            expectedLow: string[]
        ) => {
            const winner = createMockWrestler('StyleWinner', body, tech, mind);
            const results: Record<string, number> = {};

            for (let i = 0; i < 1000; i++) {
                const kimarite = determineKimarite(winner, loser);
                results[kimarite] = (results[kimarite] || 0) + 1;
            }

            // 高頻度で出るべき技のいずれかが多く出ているか
            const highCount = expectedHigh.reduce((sum, name) => sum + (results[name] || 0), 0);
            const lowCount = expectedLow.reduce((sum, name) => sum + (results[name] || 0), 0);

            // 期待される技の出現率が高いことを確認
            expect(highCount).toBeGreaterThan(lowCount);
        };

        it('Body-dominant wrestler should favor Push/Grapple moves', () => {
            runDistributionTest(
                100, 50, 50,
                ['oshidashi', 'yorikiri', 'oshitaoshi', 'yoritaoshi'],
                ['uwatenage', 'shitatenage', 'hatakikomi']
            );
        });

        it('Tech-dominant wrestler should favor Throw/Tech moves', () => {
            runDistributionTest(
                50, 100, 50,
                ['uwatenage', 'shitatenage', 'tsukiotoshi', 'sukuinage'],
                ['oshidashi', 'yorikiri']
            );
        });

        it('Mind-dominant wrestler should favor Tech/Special moves', () => {
            runDistributionTest(
                50, 50, 100,
                ['hatakikomi', 'hikiotoshi', 'tsukiotoshi', 'katasukashi'],
                ['oshidashi', 'yorikiri']
            );
        });
    });

    describe('Rarity Distribution', () => {
        it('Legendary moves should appear < 1% over 10000 trials', () => {
            const winner = createMockWrestler('LegendaryTest', 70, 70, 70);
            const legendaryNames = KIMARITE_DATA
                .filter(k => k.rarity === 'Legendary')
                .map(k => k.id);

            let legendaryCount = 0;
            const trials = 10000;

            for (let i = 0; i < trials; i++) {
                const kimarite = determineKimarite(winner, loser);
                if (legendaryNames.includes(kimarite)) {
                    legendaryCount++;
                }
            }

            const legendaryRate = legendaryCount / trials;
            console.log(`Legendary rate: ${(legendaryRate * 100).toFixed(2)}%`);

            // Legendary技は1%未満であるべき
            expect(legendaryRate).toBeLessThan(0.01);
        });
    });
});
