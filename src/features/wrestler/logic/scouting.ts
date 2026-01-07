import { Candidate } from '../../../types';

const LAST_NAMES = [
    '若', '貴', '琴', '栃', '千代', '北', '豊', '朝', '旭', '玉',
    '春', '安', '魁', '照', '御', '正', '阿', '遠', '妙', '碧'
];
const FIRST_NAMES = [
    '花', 'の富士', 'の海', 'の山', '桜', '龍', '鵬', '丸', '国',
    '勝', '嵐', '岩', '関', '戸', '城', '島', '錦', '光', '炎'
];

const BACKGROUNDS = [
    '高校柔道県大会ベスト4',
    'わんぱく相撲全国大会出場',
    'アメフト出身の巨漢',
    'レスリングでインターハイ出場',
    '実家の漁業を手伝い鍛えられた',
    '相撲未経験だが身長2mの逸材',
    '中学横綱のタイトルを持つ',
    '空手経験者で足腰が強い',
    '陸上投擲種目の元選手',
    '応援団長からの転身'
];

const generateName = (): string => {
    const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    return `${l}${f}`;
};

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

        candidates.push({
            id: `candidate-${Date.now()}-${i}`,
            heyaId: 'player_heya',
            name: generateName(),
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
