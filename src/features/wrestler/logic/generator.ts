import { Wrestler, Rank, Heya } from '../../../types';
import { ShikonaGenerator, ShikonaConfig } from './ShikonaGenerator';

const shikonaGenerator = new ShikonaGenerator();

// --- Name Generation Data ---

// 部屋のPrefixデータ（読み仮名付き）
const HEYA_PREFIX_DATA = [
    { char: '山', read: 'Yama' }, { char: '川', read: 'Kawa' }, { char: '海', read: 'Umi' },
    { char: '風', read: 'Kaze' }, { char: '雷', read: 'Ikazuchi' }, { char: '琴', read: 'Koto' },
    { char: '丸', read: 'Maru' }, { char: '玉', read: 'Tama' }, { char: '千代', read: 'Chiyo' },
    { char: '北', read: 'Kita' }, { char: '若', read: 'Waka' }, { char: '貴', read: 'Taka' },
    { char: '豊', read: 'Toyo' }, { char: '朝', read: 'Asa' }, { char: '武', read: 'Mu' },
    { char: '春', read: 'Haru' }, { char: '栃', read: 'Tochi' }, { char: '霧', read: 'Kiri' },
    { char: '旭', read: 'Kyoku' }, { char: '日', read: 'Hi' }, { char: '高', read: 'Taka' },
    { char: '安', read: 'Asa' }, { char: '隆', read: 'Taka' }, { char: '魁', read: 'Kai' },
    { char: '照', read: 'Teru' }, { char: '大', read: 'Dai' }, { char: '出', read: 'De' },
    { char: '入', read: 'Iri' }, { char: '友', read: 'Tomo' }, { char: '鏡', read: 'Kagami' },
    { char: '伊勢', read: 'Ise' }, { char: '佐渡', read: 'Sado' }, { char: '陸奥', read: 'Michinoku' },
    { char: '九重', read: 'Kokonoe' }, { char: '八角', read: 'Hakkaku' }, { char: '尾車', read: 'Oguruma' },
    { char: '木瀬', read: 'Kise' }, { char: '芝田', read: 'Shibata' }, { char: '片男', read: 'Kataonami' },
    { char: '宮城', read: 'Miyagino' }
];

// 部屋名のSuffix（〇〇部屋）
const HEYA_SUFFIXES = ['山', '川', '海', '風', '里', '浦', '灘', '嶽', '野', '花'];

// 出身地リスト (Prefectures)
export const PREFECTURES = [
    'Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima',
    'Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa',
    'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano', 'Gifu',
    'Shizuoka', 'Aichi', 'Mie', 'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara',
    'Wakayama', 'Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi',
    'Tokushima', 'Kagawa', 'Ehime', 'Kochi', 'Fukuoka', 'Saga', 'Nagasaki',
    'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa'
];

// Helper to get random element
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate Heyas (部屋 - Stables)
// Note: This logic preserves the legacy structure but uses the new data
export const generateHeyas = (): Heya[] => {
    const heyas: Heya[] = [];
    const usedHeyaNames = new Set<string>();

    // Using string arrays for tiered generation mapping
    // We map back to HEYA_PREFIX_DATA later or just extract chars
    const commonPrefixes = HEYA_PREFIX_DATA.map(d => d.char);

    const tiers = [
        { count: 3, mod: 1.5, level: 5, prefixes: ['雷', '若', '貴'] },
        { count: 7, mod: 1.2, level: 4, prefixes: ['千代', '北', '琴', '春', '豊'] },
        { count: 20, mod: 1.0, level: 3, prefixes: commonPrefixes },
        { count: 15, mod: 0.8, level: 1, prefixes: commonPrefixes }
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
                    prefix = getRandom(availablePrefixes);
                } else {
                    prefix = getRandom(commonPrefixes);
                }

                const suffix = getRandom(HEYA_SUFFIXES);
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

// Internal helper for finding reading
const getPrefixData = (char: string) => HEYA_PREFIX_DATA.find(d => d.char === char) || { char, read: '' };

// Generate Single Wrestler Helper
export const generateWrestler = (heya: Heya, rank: Rank = 'Jonokuchi', usedNames?: string[]): Wrestler => {

    // Create Config
    const origin = getRandom(PREFECTURES);
    const prefixData = getPrefixData(heya.shikonaPrefix);

    const config: ShikonaConfig = {
        heyaPrefix: prefixData.read ? prefixData : undefined,
        origin: origin
    };

    // Generate Name with retry logic for uniqueness
    let shikona = shikonaGenerator.generate(config);
    let attempts = 0;
    while (usedNames && usedNames.includes(shikona.kanji) && attempts < 50) {
        shikona = shikonaGenerator.generate(config);
        attempts++;
    }
    // Fallback if unique generation fails
    if (usedNames && usedNames.includes(shikona.kanji)) {
        shikona.kanji = shikona.kanji + '二代目';
    }

    if (usedNames) usedNames.push(shikona.kanji);

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
        name: shikona.kanji,
        reading: shikona.reading,
        origin: origin,
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
        stress: 0,
        skills: [],
        retirementStatus: 'None'
    };
};

// Generate Full Roster
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

            // Generate Name
            const origin = getRandom(PREFECTURES);
            const prefixData = getPrefixData(heya.shikonaPrefix);

            let shikona = shikonaGenerator.generate({
                heyaPrefix: prefixData.read ? prefixData : undefined,
                origin
            });

            // Unique check
            let attempts = 0;
            while (usedNames.includes(shikona.kanji) && attempts < 20) {
                shikona = shikonaGenerator.generate({
                    heyaPrefix: prefixData.read ? prefixData : undefined,
                    origin
                });
                attempts++;
            }
            if (usedNames.includes(shikona.kanji)) {
                shikona.kanji += '丸'; // Fallback
            }
            usedNames.push(shikona.kanji);

            // Stats
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
                name: shikona.kanji,
                reading: shikona.reading,
                origin,
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
                stress: 0,
                skills: [],
                retirementStatus: 'None'
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
