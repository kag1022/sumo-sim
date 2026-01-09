import { Candidate } from '../../../types';
import { ShikonaGenerator } from './ShikonaGenerator';
import { PREFECTURES } from './generator';

const shikonaGenerator = new ShikonaGenerator();

const BACKGROUNDS = [
    'judo_pref_top4',
    'wanpaku_national',
    'football_giant',
    'wrestling_interhigh',
    'fisherman_strength',
    'tall_talent',
    'junior_yokozuna',
    'karate_kicks',
    'track_thrower',
    'cheerleader'
];

export const generateCandidates = (count: number, reputation: number): Candidate[] => {
    const candidates: Candidate[] = [];

    // Reputation Rank Logic
    let minPot = 40;
    let maxPot = 80;
    let gemChance = 0; // "Gem" = High potential guaranteed

    if (reputation >= 90) {
        // Rank S
        minPot = 80; maxPot = 100; gemChance = 0.3;
    } else if (reputation >= 60) {
        // Rank A
        minPot = 70; maxPot = 95; gemChance = 0.15;
    } else if (reputation >= 30) {
        // Rank B
        minPot = 60; maxPot = 90; gemChance = 0.05;
    } else {
        // Rank C
        minPot = 50; maxPot = 80; gemChance = 0;
    }

    for (let i = 0; i < count; i++) {
        let potential: number;

        if (Math.random() < gemChance) {
            // Gem Candidate (Super Rookie)
            potential = 90 + Math.floor(Math.random() * 11); // 90-100
        } else {
            // Normal Range based on Rank
            potential = minPot + Math.floor(Math.random() * (maxPot - minPot + 1));
        }

        const flexibility = Math.floor(Math.random() * 80) + 10; // 10-90

        const mind = 10 + Math.floor(Math.random() * 15);
        const technique = 10 + Math.floor(Math.random() * 15);
        const body = 15 + Math.floor(Math.random() * 20);

        const height = 165 + Math.floor(Math.random() * 35); // 165-200
        const weight = 80 + Math.floor(Math.random() * 80); // 80-160

        // Cost calculation (Scaling with potential)
        const scoutCost = 500000 + (potential * 2000) + (weight * 500); // Increased cost for high potential
        const roundedCost = Math.floor(scoutCost / 10000) * 10000;

        const revealedStats: string[] = [];
        if (roundedCost >= 700000) revealedStats.push('flexibility');
        if (roundedCost >= 1200000) revealedStats.push('potential');

        // Generate Name & Origin
        const origin = PREFECTURES[Math.floor(Math.random() * PREFECTURES.length)];
        // Candidates don't have a Heya yet, so no heyaPrefix inheritance
        const shikona = shikonaGenerator.generate({ origin });

        candidates.push({
            id: `candidate-${Date.now()}-${i}`,
            heyaId: 'player_heya',
            name: shikona.kanji,
            reading: shikona.reading,
            origin: origin,
            rank: 'Jonokuchi',
            stats: { mind, technique, body },
            isSekitori: false,
            injuryStatus: 'healthy',
            potential,
            flexibility,
            height,
            weight,
            background: BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)],
            scoutCost: roundedCost,
            revealedStats,
            age: 15 + Math.floor(Math.random() * 4),
            maxRank: 'Jonokuchi',
            historyMaxLength: 0,
            timeInHeya: 0,
            injuryDuration: 0,
            consecutiveLoseOrAbsent: 0,
            stress: 0,
            skills: [],
            retirementStatus: 'None'
        });
    }

    return candidates;
};

// Return a Grade string S-E based on value
export const getGrade = (val: number): string => {
    if (val >= 90) return 'S';
    if (val >= 80) return 'A';
    if (val >= 70) return 'B';
    if (val >= 60) return 'C';
    if (val >= 50) return 'D';
    return 'E';
};
