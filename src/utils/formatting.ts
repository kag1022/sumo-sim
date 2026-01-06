import { Rank } from '../types';
import i18n from '../i18n';

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
    const isJa = i18n.language === 'ja' || !i18n.language || i18n.language.startsWith('ja');
    const rankStr = i18n.t(`rank.${rank}`);
    const sideStr = side ? i18n.t(`rank.${side}`) : '';

    // Sanyaku (Named Ranks)
    if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi'].includes(rank)) {
        return isJa ? `${sideStr}${rankStr}` : `${sideStr} ${rankStr}`.trim();
    }

    if (rank === 'MaeZumo') return rankStr;

    // Number Handling
    let numStr = '';
    if (number) {
        if (isJa) {
            if (number === 1) {
                numStr = '筆頭';
            } else {
                numStr = `${toKanjiNumeral(number)}枚目`;
            }
        } else {
            numStr = ` ${number}`;
        }
    }

    // Formatting
    if (isJa) {
        return `${sideStr}${rankStr}${numStr}`;
    } else {
        // English: "East Maegashira 1"
        return `${sideStr} ${rankStr}${numStr}`.trim();
    }
};
