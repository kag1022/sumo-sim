import { Rank } from '../types';

const toKanjiNumeral = (num: number): string => {
    if (num === 0) return '';

    // Digits
    const kanjiDigits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    if (num < 10) return kanjiDigits[num];
    if (num < 20) return `十${kanjiDigits[num % 10]}`;
    if (num < 100) {
        const tens = Math.floor(num / 10);
        const ones = num % 10;
        return `${kanjiDigits[tens]}十${kanjiDigits[ones]}`;
    }

    // 100+ support
    // Logic: Hundreds + Tens + Ones
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;

    // "百" (100) is special? No, usually "一百" is just "百". "二百" is "200".
    // "百二十" (120). "百五" (105).
    // If hundreds is 1, just "百", else "Number"+"百".

    const hundredsStr = hundreds === 1 ? '百' : `${kanjiDigits[hundreds]}百`;

    // Handle remainder (0-99)
    let remainderStr = '';
    if (remainder > 0) {
        if (remainder < 10) {
            // e.g. 105 -> 百五 (not 百零五 usually in banzuke? Actually banzuke often uses just Kanji digits vertically).
            // But for linear text "百五枚目" is readable.
            remainderStr = kanjiDigits[remainder];
        } else if (remainder < 20) {
            remainderStr = `十${kanjiDigits[remainder % 10]}`;
        } else {
            const tens = Math.floor(remainder / 10);
            const ones = remainder % 10;
            remainderStr = `${kanjiDigits[tens]}十${kanjiDigits[ones]}`;
        }
    }

    return `${hundredsStr}${remainderStr}`;
};

export const formatRank = (rank: Rank, side?: 'East' | 'West', number?: number): string => {
    const sideStr = side === 'West' ? '西' : '東';

    // Sanyaku (Named Ranks)
    if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi'].includes(rank)) {
        const rankMap: Record<string, string> = {
            'Yokozuna': '横綱',
            'Ozeki': '大関',
            'Sekiwake': '関脇',
            'Komusubi': '小結'
        };
        return `${sideStr}${rankMap[rank]}`;
    }

    // Maegashira and below
    let rankName = '';
    switch (rank) {
        case 'Maegashira': rankName = '前頭'; break;
        case 'Juryo': rankName = '十両'; break;
        case 'Makushita': rankName = '幕下'; break;
        case 'Sandanme': rankName = '三段目'; break;
        case 'Jonidan': rankName = '序二段'; break;
        case 'Jonokuchi': rankName = '序ノ口'; break;
    }

    // Number Handling
    let numStr = '';
    if (number) {
        if (number === 1) {
            numStr = '筆頭';
        } else {
            // Use Enhanced Kanji Logic
            numStr = `${toKanjiNumeral(number)}枚目`;
        }
    }

    return `${sideStr}${rankName}${numStr}`;
};
