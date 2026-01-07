
/**
 * Configuration for shikona generation.
 * 四股名生成のための設定インターフェース
 */
export interface ShikonaConfig {
    /**
     * Character meant to be inherited from the Heya (Stable).
     * 部屋から継承される文字（例: "琴", "千代"）
     */
    heyaPrefix?: { char: string; read: string };

    /**
     * Wrestler's place of origin. Used to add local flavor.
     * 出身地（例: "Hokkaido", "Osaka"）
     */
    origin?: string;
}

/**
 * Represents a generated Shikona (Sumo Name).
 * 生成された四股名オブジェクト
 */
export interface Shikona {
    /** The display string of the shikona (Kanji) */
    kanji: string;
    /** The reading of the shikona (Romaji or Hiragana/Katakana as per system need, likely Romaji based on existing code) */
    reading: string;
}

type Kanji = { char: string; read: string };
export type Region = 'Northern' | 'Southern' | 'Ocean' | 'Mountain' | 'Strong';

// --- Data Sets (Min 15 each) ---

/** Common prefixes for sumo names (Running/Top character) */
const COMMON_PREFIXES: Kanji[] = [
    { char: '若', read: 'Waka' }, { char: '貴', read: 'Taka' }, { char: '豊', read: 'Toyo' },
    { char: '朝', read: 'Asa' }, { char: '栃', read: 'Tochi' }, { char: '琴', read: 'Koto' },
    { char: '千代', read: 'Chiyo' }, { char: '北', read: 'Kita' }, { char: '春', read: 'Haru' },
    { char: '大', read: 'Dai' }, { char: '安', read: 'A' }, { char: '旭', read: 'Kyoku' },
    { char: '日', read: 'Hi' }, { char: '隆', read: 'Taka' }, { char: '安', read: 'Yasu' },
    { char: '輝', read: 'Teru' }, { char: '妙', read: 'Myo' }, { char: '正', read: 'Sho' },
    { char: '遠', read: 'En' }, { char: '阿', read: 'A' }
];

/** Common suffixes for sumo names (Bottom character) */
const COMMON_SUFFIXES: Kanji[] = [
    { char: '山', read: 'yama' }, { char: '海', read: 'umi' }, { char: '川', read: 'kawa' },
    { char: '里', read: 'sato' }, { char: '錦', read: 'nishiki' }, { char: '富士', read: 'fuji' },
    { char: '国', read: 'kuni' }, { char: '龍', read: 'ryu' }, { char: '鵬', read: 'ho' },
    { char: '花', read: 'hana' }, { char: '昇', read: 'sho' }, { char: '桜', read: 'zakura' },
    { char: '丸', read: 'maru' }, { char: '嵐', read: 'arashi' }, { char: '風', read: 'kaze' },
    { char: '王', read: 'ou' }, { char: '鷹', read: 'taka' }, { char: '浪', read: 'nami' },
    { char: '城', read: 'jo' }, { char: '疾風', read: 'hayate' }
];

/** Regional flavor characters */
const REGIONAL_KANJI: Record<Region, Kanji[]> = {
    Northern: [ // Hokkaido, Tohoku
        { char: '北', read: 'Kita' }, { char: '氷', read: 'Hyou' }, { char: '凍', read: 'Tou' },
        { char: '奥', read: 'Oku' }, { char: '羽', read: 'Ha' }, { char: '雪', read: 'Yuki' },
        { char: '寒', read: 'Kan' }, { char: '白', read: 'Haku' }, { char: '銀', read: 'Gin' },
        { char: '涼', read: 'Ryo' }, { char: '冬', read: 'Fuyu' }, { char: '杜', read: 'To' },
        { char: '樹', read: 'Ju' }, { char: '峰', read: 'Mine' }, { char: '陸', read: 'Riku' }
    ],
    Southern: [ // Kyushu, Okinawa
        { char: '南', read: 'Minami' }, { char: '琉', read: 'Ryu' }, { char: '球', read: 'Kyu' },
        { char: '陽', read: 'You' }, { char: '暑', read: 'Sho' }, { char: '夏', read: 'Natsu' },
        { char: '薩', read: 'Satsu' }, { char: '摩', read: 'Ma' }, { char: '熊', read: 'Kuma' },
        { char: '襲', read: 'So' }, { char: '島', read: 'Shima' }, { char: '沖', read: 'Oki' },
        { char: '那', read: 'Na' }, { char: '覇', read: 'Ha' }, { char: '炎', read: 'En' }
    ],
    Ocean: [ // Coastal areas, Shikoku
        { char: '海', read: 'Umi' }, { char: '灘', read: 'Nada' }, { char: '洋', read: 'You' },
        { char: '浜', read: 'Hama' }, { char: '浦', read: 'Ura' }, { char: '潮', read: 'Shio' },
        { char: '波', read: 'Nami' }, { char: '津', read: 'Tsu' }, { char: '岸', read: 'Kishi' },
        { char: '湊', read: 'Minato' }, { char: '渦', read: 'Uzu' }, { char: '澪', read: 'Mio' },
        { char: '洲', read: 'Shu' }, { char: '湾', read: 'Wan' }, { char: '汐', read: 'Shio' }
    ],
    Mountain: [ // Inland, Chubu
        { char: '山', read: 'Yama' }, { char: '岳', read: 'Gaku' }, { char: '岩', read: 'Iwa' },
        { char: '峰', read: 'Mine' }, { char: '嵐', read: 'Arashi' }, { char: '谷', read: 'Tani' },
        { char: '峡', read: 'Kyo' }, { char: '嶺', read: 'Rei' }, { char: '崖', read: 'Gai' },
        { char: '磐', read: 'Ban' }, { char: '石', read: 'Ishi' }, { char: '鉱', read: 'Kou' },
        { char: '麓', read: 'Roku' }, { char: '仙', read: 'Sen' }, { char: '高', read: 'Taka' }
    ],
    Strong: [ // Default/Urban
        { char: '剛', read: 'Gou' }, { char: '覇', read: 'Ha' }, { char: '王', read: 'Ou' },
        { char: '皇', read: 'Kou' }, { char: '龍', read: 'Ryu' }, { char: '虎', read: 'Ko' },
        { char: '獅', read: 'Shi' }, { char: '力', read: 'Riki' }, { char: '勝', read: 'Sho' },
        { char: '勇', read: 'Yu' }, { char: '将', read: 'Sho' }, { char: '天', read: 'Ten' },
        { char: '武', read: 'Bu' }, { char: '神', read: 'Shin' }, { char: '聖', read: 'Sei' }
    ]
};

/** Mapping origins to regions */
const ORIGIN_MAP: Record<string, Region> = {
    'Hokkaido': 'Northern', 'Aomori': 'Northern', 'Iwate': 'Northern', 'Akita': 'Northern',
    'Miyagi': 'Northern', 'Yamagata': 'Northern', 'Fukushima': 'Northern',
    'Okinawa': 'Southern', 'Kagoshima': 'Southern', 'Miyazaki': 'Southern', 'Kumamoto': 'Southern',
    'Kochi': 'Ocean', 'Tokushima': 'Ocean', 'Ehime': 'Ocean', 'Kagawa': 'Ocean',
    'Chiba': 'Ocean', 'Kanagawa': 'Ocean',
    'Nagano': 'Mountain', 'Gifu': 'Mountain', 'Yamanashi': 'Mountain',
    // ... defaults to Strong if not found
};

/**
 * Class responsible for generating authentic Sumo names (Shikona).
 * 高度な四股名生成を行うクラス。
 * 継承、出身地、構成のバリエーションを考慮します。
 */
export class ShikonaGenerator {

    /**
     * Helper to determine region from origin.
     * UIでのアイコン表示などに利用可能です。
     */
    public static getRegion(origin: string): Region {
        return ORIGIN_MAP[origin] || 'Strong';
    }

    /**
     * Generates a new Shikona based on the provided configuration.
     * 設定に基づいて新しい四股名を生成します。
     * @param config Configuration object (heyaPrefix, origin)
     * @returns Shikona object with kanji and reading
     */
    public generate(config: ShikonaConfig): Shikona {
        const { heyaPrefix, origin } = config;

        // Strategy Selection
        const useHeyaPrefix = heyaPrefix && Math.random() < 0.7;
        const useOrigin = origin && Math.random() < 0.3;

        // Determine Length Structure (2, 3, or 4 chars)
        // 2 chars (30%), 3 chars (50%), 4 chars (20%)
        const roll = Math.random();
        let lengthMode: 2 | 3 | 4;

        if (roll < 0.30) lengthMode = 2;
        else if (roll < 0.80) lengthMode = 3;
        else lengthMode = 4;

        // Force 2 or 3 chars if heyaPrefix is already long? 
        // If heyaPrefix is 2 chars (e.g. 千代 Chiyo), and we want length 2, it's just the prefix.
        // We should adjust to ensure we append something unless the prefix itself is the name (unlikely for new recruits).
        // Let's assume if heyaPrefix is 2 chars, length must be at least 3 or 4.
        if (useHeyaPrefix && heyaPrefix!.char.length >= 2) {
            lengthMode = Math.random() < 0.5 ? 3 : 4;
        }

        let parts: Kanji[] = [];

        // --- Logic Construction ---

        // 1. Prefix Selection
        let prefix: Kanji;
        if (useHeyaPrefix) {
            prefix = heyaPrefix!;
        } else {
            prefix = this.getRandomElement(COMMON_PREFIXES);
        }

        // 2. Suffix/Regional Selection
        // If origin is active, we pick a regional char. 
        // It serves as the Suffix in 2-char mode, or the Middle/Suffix in 3/4 modes.
        let localFlavor: Kanji | null = null;
        if (useOrigin) {
            const region = this.getRegion(origin!);
            localFlavor = this.getRandomElement(REGIONAL_KANJI[region]);
        }

        let suffix: Kanji = this.getRandomElement(COMMON_SUFFIXES);

        // 3. Assemble based on Length Mode

        if (lengthMode === 2) {
            // Pattern: [Prefix][Suffix/Local]
            // If local flavor is active, it overrides the common suffix to ensure visibility
            const finalSuffix = localFlavor || suffix;
            parts = [prefix, finalSuffix];

        } else if (lengthMode === 3) {
            // Pattern: [Prefix][Middle][Suffix]
            // We need a middle char.
            // If local flavor is active, use it as Middle or Suffix.
            // Let's use local flavor as Middle to make it [Prefix][Local][Suffix]
            // OR [Prefix][Common][Local]

            if (localFlavor) {
                // 50/50 chance for position
                if (Math.random() < 0.5) {
                    parts = [prefix, localFlavor, suffix];
                } else {
                    const middle = this.getRandomElement(COMMON_PREFIXES.filter(p => p.char !== prefix.char));
                    parts = [prefix, middle, localFlavor];
                }
            } else {
                // No local flavor, need a middle char. 
                // Often 3 char names are [Prefix (1)][Suffix (2)] or [Prefix (1)][Middle (1)][Suffix (1)]
                // Let's grab another "Common Prefix" or "Common Suffix" as filler?
                // Better: Use a "Strong" char as filler if no local flavor
                const filler = this.getRandomElement(REGIONAL_KANJI.Strong);
                parts = [prefix, filler, suffix];
            }

        } else if (lengthMode === 4) {
            // Pattern: 20% of names.
            // Spec: "4文字(「ノ/の」入り20%)" -> Means if 4 chars is selected, we likely use 'no'.
            // Or maybe the user meant 20% of *all* names are 4-char-with-no.
            // Since we already gated lengthMode=4 behind 20% probability, we should probably always use 'no' here 
            // OR allow [Prefix][Suffix] where both are 2 chars.
            // Let's do the "no" pattern as it's iconic.

            // Particle "no"
            const particle: Kanji = Math.random() < 0.5
                ? { char: 'ノ', read: 'no' }
                : { char: 'の', read: 'no' };

            // For "no" pattern: [Prefix] + no + [Suffix]
            // E.g. Taka-no-hana (貴ノ花).
            // Uses standard prefix and standard suffix (or local).
            const finalSuffix = localFlavor || suffix;
            parts = [prefix, particle, finalSuffix];
        }

        // --- Final Assembly ---
        const combinedKanji = parts.map(p => p.char).join('');
        // Clean up reading: lowercase usually, capitalize first letter? 
        // Existing system uses capitalized English? (e.g. "Wakanohana")
        // Let's enable PascalCase for the full string.
        const combinedReading = parts.map(p => p.read).join('');

        // Capitalize first letter, rest lowercase (if that's the style) or PascalCase each part?
        // Examples: "Kitanoumi". "Kita" + "no" + "umi".
        // Let's return PascalCase for the whole string if possible, or just join them.
        // The data has "Waka", "Taka". "yama", "umi".
        // Joining "Waka" + "yama" -> "Wakayama". Perfect.
        // Result: "Kita" + "no" + "umi" -> "Kitanoumi".
        // Seems the data definition handles the casing well for concatenation!
        return {
            kanji: combinedKanji,
            reading: this.formatReading(combinedReading)
        };
    }

    private getRegion(origin: string): Region {
        return ShikonaGenerator.getRegion(origin);
    }

    private getRandomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    private formatReading(raw: string): string {
        if (!raw) return '';
        // Ensure first char is Upper, rest seem to be mixed because inputs are mixed (e.g. "Waka", "yama").
        // "Wakayama" is fine. "KitaNoUmi" might be desired or "Kitanoumi".
        // Start with simple concat. If needed, normalize.
        // Let's normalize to Capitalized first, rest lowercase?
        // "Waka" + "yama" -> "Wakayama"
        // "Kita" + "no" + "umi" -> "Kitanoumi"
        // Inputs: "Waka", "Kita" (Capitalized). "yama", "umi" (lowercase).
        // Result: "Waka" + "yama" -> "Wakayama". 
        // Result: "Kita" + "no" + "umi" -> "Kitanoumi".
        // Seems the data definition handles the casing well for concatenation!
        return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
}
