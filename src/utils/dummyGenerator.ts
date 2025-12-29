import { Wrestler, Rank, Heya } from '../types';
// unused import removed

// --- Name Generation Data ---
// 部屋のPrefixリスト（自然＋相撲らしい文字）
const HEYA_PREFIXES = [
    '山', '川', '海', '風', '雷', '琴', '丸', '玉', '千代', '北',
    '若', '貴', '豊', '朝', '武', '春', '栃', '霧', '旭', '日',
    '高', '安', '隆', '魁', '照', '大', '出', '入', '友', '鏡',
    '伊勢', '佐渡', '陸奥', '九重', '八角', '尾車', '木瀬', '芝田', '片男', '宮城'
];
// 部屋名のSuffix（〇〇部屋）
const HEYA_SUFFIXES = ['山', '川', '海', '風', '里', '浦', '灘', '嶽', '野', '花'];

// 力士名のSuffix（Prefixの後に続く文字）
const SHIKONA_SUFFIXES = [
    '龍', '鳳', '虎', '王', '花', '国', '里', '道', '剛', '力',
    '山', '海', '川', '人', '樹', '真', '勝', '輝', '光', '天',
    '錦', '富士', '桜', '椿', '嵐', '丸', '之助', '太郎', '衛門', '乃花',
    '疾風', '飛翔', '大将', '勇気', '正義', '平和', '希望', '未来', '夢', '愛'
];

export const generateHeyas = (count: number = 45): Heya[] => {
    const heyas: Heya[] = [];
    const usedNames = new Set<string>();

    for (let i = 0; i < count; i++) {
        // Generate Unique Name
        let name = '';
        let prefix = '';
        let tries = 0;

        while (!name || usedNames.has(name)) {
            prefix = HEYA_PREFIXES[Math.floor(Math.random() * HEYA_PREFIXES.length)];
            const suffix = HEYA_SUFFIXES[Math.floor(Math.random() * HEYA_SUFFIXES.length)];
            // Avoid "Mounatin Mountain" (Yama-yama)
            if (prefix === suffix) continue;

            // e.g. "高" + "砂" -> 高砂部屋 (Simulated)
            // Just use Prefix + Suffix for room name
            name = prefix + suffix;
            tries++;
            if (tries > 100) name = prefix + suffix + '変'; // Fallback
        }

        usedNames.add(name);

        heyas.push({
            id: `heya-${i}`,
            name: name + '部屋',
            shikonaPrefix: prefix,
            strengthMod: 0.8 + Math.random() * 0.4, // 0.8 - 1.2
            wrestlerCount: 0
        });
    }
    return heyas;
};

// Generate Name based on Heya Prefix
const generateShikona = (prefix: string): string => {
    const suffix = SHIKONA_SUFFIXES[Math.floor(Math.random() * SHIKONA_SUFFIXES.length)];
    return prefix + suffix;
}

// Discrete Potential Generation
const generatePotential = (): number => {
    const rand = Math.random();
    if (rand < 0.01) {
        // Genius (1%): 90-100
        return 90 + Math.floor(Math.random() * 11);
    } else if (rand < 0.10) {
        // Talented (9%): 80-89
        return 80 + Math.floor(Math.random() * 10);
    } else if (rand < 0.40) {
        // Good (30%): 65-79
        return 65 + Math.floor(Math.random() * 15);
    } else {
        // Average (60%): 40-64
        return 40 + Math.floor(Math.random() * 25);
    }
};

// Generate Single Wrestler Helper
export const generateWrestler = (heya: Heya, rank: Rank = 'Jonokuchi'): Wrestler => {
    const name = generateShikona(heya.shikonaPrefix);
    const potential = generatePotential();

    // Stats relative to Rank
    // Initial stats for new recruits: around 20-30.
    const baseStat = rank === 'Jonokuchi' ? 15 : 40;
    const variation = () => Math.floor(Math.random() * 10);

    const stats = {
        mind: Math.min(potential, baseStat + variation()),
        technique: Math.min(potential, baseStat + variation()),
        body: Math.min(potential, baseStat + variation())
    };

    let uniqueId = `cpu-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
        id: uniqueId,
        heyaId: heya.id,
        name: name,
        rank,
        rankSide: 'East',
        rankNumber: 1, // Default
        stats,
        isSekitori: false,
        injuryStatus: 'healthy',
        history: [],
        currentBashoStats: { wins: 0, losses: 0 },
        potential,
        flexibility: 10 + Math.floor(Math.random() * 90),
        weight: 100 + Math.floor(Math.random() * 60), // Young, lighter
        height: 165 + Math.floor(Math.random() * 30),
        background: '一般入門',
        age: 15, // Young recruit
        maxRank: rank,
        historyMaxLength: 0,
        timeInHeya: 0,
        injuryDuration: 0,
        consecutiveLoseOrAbsent: 0
    };
};

export const generateFullRoster = (existingHeyas: Heya[]): Wrestler[] => {
    const wrestlers: Wrestler[] = [];
    const heyas = existingHeyas;

    // Weights for rank distribution (approximations)
    const quotas = {
        Yokozuna: 2,
        Ozeki: 4,
        Sekiwake: 4,
        Komusubi: 4,
        Maegashira: 28, // Top Maegashira to Bottom
        Juryo: 28,
        Makushita: 120,
        Sandanme: 200,
        Jonidan: 230,
        Jonokuchi: 80
    };

    let globalRankCount = 0;

    // Helper to get Heya and update count
    const getHeya = (): Heya => {
        // Pick random heya
        const heya = heyas[Math.floor(Math.random() * heyas.length)];
        heya.wrestlerCount++;
        return heya;
    }

    const createBatch = (rank: Rank, count: number, startNumber: number = 1) => {
        for (let i = 0; i < count; i++) {
            const isWest = i % 2 === 1;
            const rankNumber = Math.floor(i / 2) + startNumber;

            const heya = getHeya();
            const name = generateShikona(heya.shikonaPrefix);

            // Base stats based on rank
            let baseStat = 20;
            if (rank === 'Yokozuna') baseStat = 90;
            else if (rank === 'Ozeki') baseStat = 80;
            else if (rank === 'Sekiwake') baseStat = 75;
            else if (rank === 'Komusubi') baseStat = 70;
            else if (rank === 'Maegashira') baseStat = 60;
            else if (rank === 'Juryo') baseStat = 50;
            else if (rank === 'Makushita') baseStat = 40;
            else if (rank === 'Sandanme') baseStat = 30;

            // Random variation +/- 10
            const variation = () => Math.floor(Math.random() * 20) - 10;

            // Apply Heya Strength Mod
            const mod = heya.strengthMod;

            const stats = {
                mind: Math.min(100, Math.max(1, Math.floor((baseStat + variation()) * mod))),
                technique: Math.min(100, Math.max(1, Math.floor((baseStat + variation()) * mod))),
                body: Math.min(100, Math.max(1, Math.floor((baseStat + variation()) * mod)))
            };

            wrestlers.push({
                id: `cpu-${globalRankCount++}`,
                heyaId: heya.id,
                name: name,
                rank,
                rankSide: isWest ? 'West' : 'East',
                rankNumber,
                stats,
                isSekitori: ['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira', 'Juryo'].includes(rank),
                injuryStatus: 'healthy',
                history: [],
                currentBashoStats: { wins: 0, losses: 0 },
                potential: 50 + Math.floor(Math.random() * 50),
                flexibility: 10 + Math.floor(Math.random() * 90),
                weight: 100 + Math.floor(Math.random() * 100),
                height: 160 + Math.floor(Math.random() * 40),
                background: '一般入門',
                age: 18 + Math.floor(Math.random() * 15), // 18-33
                maxRank: rank,
                historyMaxLength: 0,
                timeInHeya: Math.floor(Math.random() * 120), // 0-10 years
                injuryDuration: 0,
                consecutiveLoseOrAbsent: 0
            });
        }
    };

    createBatch('Yokozuna', quotas.Yokozuna);
    createBatch('Ozeki', quotas.Ozeki);
    createBatch('Sekiwake', quotas.Sekiwake);
    createBatch('Komusubi', quotas.Komusubi);
    createBatch('Maegashira', quotas.Maegashira);
    createBatch('Juryo', quotas.Juryo);
    createBatch('Makushita', quotas.Makushita);
    createBatch('Sandanme', quotas.Sandanme);
    createBatch('Jonidan', quotas.Jonidan);
    createBatch('Jonokuchi', 300); // Increased to fill population to ~950

    return wrestlers;
};
