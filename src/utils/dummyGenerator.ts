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

// 力士名の Prefix (上) - 大幅に拡張
const SHIKONA_PREFIXES = [
    '若', '貴', '琴', '栃', '千代', '朝', '北', '豊', '正', '高',
    '安', '大', '玉', '春', '輝', '遠', '妙', '阿', '隆', '竜',
    '旭', '日', '魁', '美', '翔', '英', '武', '天', '海', '山',
    '柏', '鵬', '鶴', '霧', '荒', '双', '照', '剣', '豪', '勢',
    '錦', '御', '志', '清', '泉', '白', '紅', '碧', '蒼', '黒',
    '金', '銀', '鋼', '鉄', '石', '岩', '雪', '氷', '炎', '光',
    '影', '月', '星', '雷', '嵐', '風', '雲', '霞', '虹', '露',
    '宝', '福', '寿', '祥', '瑞', '嘉', '慶', '吉', '幸', '栄',
    '丹', '藤', '梅', '松', '竹', '桜', '楓', '蓮', '椿', '萩'
];

// 力士名のSuffix（下） - 大幅に拡張
const SHIKONA_SUFFIXES = [
    '山', '川', '海', '里', '富士', '花', '国', '龍', '鵬', '錦',
    '昇', '桜', '丸', '嵐', '風', '王', '鷹', '浪', '若', '城',
    '疾風', '響', '岳', '灘', '関', '岩', '輝', '闘', '聖', '覇',
    '光', '兜', '刃', '翼', '翔', '颯', '雅', '馬', '獅', '虎',
    '豹', '龍', '鳳', '凰', '麟', '亀', '蛇', '雀', '鶴', '鷲',
    '之助', '太郎', '衛門', '乃花', '之里', '之海', '之山', '乃風',
    '道', '潮', '曙', '波', '洋', '州', '郷', '宮', '宿', '荘',
    '堂', '殿', '院', '閣', '楼', '塔', '碑', '門', '壇', '台',
    'ノ里', 'ノ山', 'ノ海', 'ノ花', 'ノ川', 'ノ国', 'ノ富士'
];

// ユニーク四股名生成関数
export const generateUniqueName = (usedNames: string[], heyaPrefix?: string, forcePrefix: boolean = false): string => {
    const maxRetries = 100;
    let attempts = 0;

    while (attempts < maxRetries) {
        let name = '';

        // 70%: heyaPrefix + Suffix パターン (forcePrefix=trueなら100%)
        // 30%: ランダムPrefix + Suffix パターン
        if (heyaPrefix && (forcePrefix || Math.random() < 0.7)) {
            const suffix = SHIKONA_SUFFIXES[Math.floor(Math.random() * SHIKONA_SUFFIXES.length)];
            name = heyaPrefix + suffix;
        } else {
            const prefix = SHIKONA_PREFIXES[Math.floor(Math.random() * SHIKONA_PREFIXES.length)];
            const suffix = SHIKONA_SUFFIXES[Math.floor(Math.random() * SHIKONA_SUFFIXES.length)];
            // 時々「〇〇ノ〇」パターン (3割)
            if (Math.random() < 0.3 && !suffix.startsWith('ノ') && !suffix.startsWith('の')) {
                const bridgeSuffixes = ['ノ里', 'ノ山', 'ノ海', 'ノ花', 'ノ富士'];
                const bridge = bridgeSuffixes[Math.floor(Math.random() * bridgeSuffixes.length)];
                name = prefix + bridge;
            } else {
                name = prefix + suffix;
            }
        }

        if (!usedNames.includes(name)) {
            return name;
        }
        attempts++;
    }

    // Fallback: 「二代目」などを付加
    const baseName = SHIKONA_PREFIXES[Math.floor(Math.random() * SHIKONA_PREFIXES.length)] +
        SHIKONA_SUFFIXES[Math.floor(Math.random() * SHIKONA_SUFFIXES.length)];

    const generations = ['二代目 ', '三代目 ', '四代目 ', '改 '];
    for (const gen of generations) {
        const fallbackName = gen + baseName;
        if (!usedNames.includes(fallbackName)) {
            return fallbackName;
        }
    }

    // Ultimate fallback with timestamp
    return `新人力士${Date.now().toString().slice(-6)}`;
};

// Generate Heyas (部屋 - Stables)
export const generateHeyas = (): Heya[] => {
    const heyas: Heya[] = [];
    const usedHeyaNames = new Set<string>();

    const tiers = [
        { count: 3, mod: 1.5, level: 5, prefixes: ['雷', '若', '貴'] },
        { count: 7, mod: 1.2, level: 4, prefixes: ['千代', '北', '琴', '春', '豊'] },
        { count: 20, mod: 1.0, level: 3, prefixes: HEYA_PREFIXES },
        { count: 15, mod: 0.8, level: 1, prefixes: HEYA_PREFIXES }
    ];

    let overallIndex = 0;

    tiers.forEach(tier => {
        for (let i = 0; i < tier.count; i++) {
            let name = '';
            let prefix = '';
            let tries = 0;

            const availablePrefixes = tier.prefixes;

            while (!name || usedHeyaNames.has(name)) {
                if (tries < 10) {
                    prefix = availablePrefixes[Math.floor(Math.random() * availablePrefixes.length)];
                } else {
                    prefix = HEYA_PREFIXES[Math.floor(Math.random() * HEYA_PREFIXES.length)];
                }

                const suffix = HEYA_SUFFIXES[Math.floor(Math.random() * HEYA_SUFFIXES.length)];
                if (prefix === suffix) continue;
                name = prefix + suffix;
                tries++;
                if (tries > 100) name = prefix + suffix + '変';
            }

            usedHeyaNames.add(name);

            heyas.push({
                id: `heya-${overallIndex++}`,
                name: name + '部屋',
                shikonaPrefix: prefix,
                strengthMod: tier.mod,
                facilityLevel: tier.level,
                wrestlerCount: 0
            });
        }
    });

    return heyas;
};

// Generate Name based on Heya Prefix (Legacy, now uses unique)
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

// Generate Single Wrestler Helper (with unique name support)
export const generateWrestler = (heya: Heya, rank: Rank = 'Jonokuchi', usedNames?: string[]): Wrestler => {
    const name = usedNames
        ? generateUniqueName(usedNames, heya.shikonaPrefix)
        : generateShikona(heya.shikonaPrefix);

    if (usedNames) usedNames.push(name);

    const potential = generatePotential();

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
        rankNumber: 1,
        stats,
        isSekitori: false,
        injuryStatus: 'healthy',
        history: [],
        currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
        nextBoutDay: null,
        potential,
        flexibility: 10 + Math.floor(Math.random() * 90),
        weight: 100 + Math.floor(Math.random() * 60),
        height: 165 + Math.floor(Math.random() * 30),
        background: '一般入門',
        age: 15,
        maxRank: rank,
        historyMaxLength: 0,
        timeInHeya: 0,
        injuryDuration: 0,
        consecutiveLoseOrAbsent: 0,
        stress: 0
    };
};

// Generate Full Roster (with unique name registry)
export const generateFullRoster = (existingHeyas: Heya[], usedNames: string[] = []): Wrestler[] => {
    const wrestlers: Wrestler[] = [];
    const heyas = existingHeyas;

    const quotas = {
        Yokozuna: 2,
        Ozeki: 4,
        Sekiwake: 4,
        Komusubi: 4,
        Maegashira: 28,
        Juryo: 28,
        Makushita: 120,
        Sandanme: 200,
        Jonidan: 230,
        Jonokuchi: 80
    };

    let globalRankCount = 0;

    let heyaIndex = 0;
    const shuffledHeyas = [...heyas].sort(() => Math.random() - 0.5);

    const getBalancedHeya = (): Heya => {
        const heya = shuffledHeyas[heyaIndex];
        heya.wrestlerCount++;
        heyaIndex = (heyaIndex + 1) % shuffledHeyas.length;
        return heya;
    }

    const createBatch = (rank: Rank, count: number, startNumber: number = 1) => {
        for (let i = 0; i < count; i++) {
            const isWest = i % 2 === 1;
            const rankNumber = Math.floor(i / 2) + startNumber;

            const heya = getBalancedHeya();
            const name = generateUniqueName(usedNames, heya.shikonaPrefix);
            usedNames.push(name);

            let baseStat = 20;
            if (rank === 'Yokozuna') baseStat = 90;
            else if (rank === 'Ozeki') baseStat = 80;
            else if (rank === 'Sekiwake') baseStat = 75;
            else if (rank === 'Komusubi') baseStat = 70;
            else if (rank === 'Maegashira') baseStat = 60;
            else if (rank === 'Juryo') baseStat = 50;
            else if (rank === 'Makushita') baseStat = 40;
            else if (rank === 'Sandanme') baseStat = 30;

            const variation = () => Math.floor(Math.random() * 20) - 10;
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
                currentBashoStats: { wins: 0, losses: 0, matchHistory: [] },
                nextBoutDay: null,
                potential: 50 + Math.floor(Math.random() * 50),
                flexibility: 10 + Math.floor(Math.random() * 90),
                weight: 100 + Math.floor(Math.random() * 100),
                height: 160 + Math.floor(Math.random() * 40),
                background: '一般入門',
                age: 18 + Math.floor(Math.random() * 15),
                maxRank: rank,
                historyMaxLength: 0,
                timeInHeya: Math.floor(Math.random() * 120),
                injuryDuration: 0,
                consecutiveLoseOrAbsent: 0,
                stress: 0
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
    createBatch('Jonokuchi', 300);

    return wrestlers;
};
