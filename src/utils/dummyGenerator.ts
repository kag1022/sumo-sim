import { Wrestler, Rank } from '../types';
import { QUOTA_MAKUUCHI, QUOTA_JURYO, QUOTA_MAKUSHITA } from './constants';

const LAST_NAMES = [
    '栃', '若', '琴', '貴', '千代', '北', '玉', '朝', '豊', '大',
    '隆', '輝', '錦', '阿', '美', '照', '翔', '剣', '明', '竜',
    '旭', '霧', '春', '蒼', '炎', '翠', '王', '正', '遠', '高'
];

const FIRST_NAMES = [
    '山', '川', '海', '里', '富士', '桜', '龍', '虎', '鵬', '丸',
    '国', '勝', '乃', '花', '嵐', '岩', '関', '戸', '城', '島'
];

const generateName = (id: number): string => {
    const p = LAST_NAMES[id % LAST_NAMES.length];
    const s = FIRST_NAMES[(id * 3) % FIRST_NAMES.length];
    return `${p}${s}`;
};

export const generateFullRoster = (): Wrestler[] => {
    const wrestlers: Wrestler[] = [];
    const TOTAL_WRESTLERS = 940;

    for (let i = 0; i < TOTAL_WRESTLERS; i++) {
        let rank: Rank = 'Jonokuchi';
        let statsBase = 10;
        let isSekitori = false;

        if (i < QUOTA_MAKUUCHI) {
            if (i === 0) rank = 'Yokozuna';
            else if (i < 3) rank = 'Ozeki';
            else if (i < 5) rank = 'Sekiwake';
            else if (i < 7) rank = 'Komusubi';
            else rank = 'Maegashira';

            statsBase = 90 - i * 0.5;
            isSekitori = true;
        } else if (i < QUOTA_MAKUUCHI + QUOTA_JURYO) {
            rank = 'Juryo';
            statsBase = 70 - (i - QUOTA_MAKUUCHI) * 0.5;
            isSekitori = true;
        } else if (i < QUOTA_MAKUUCHI + QUOTA_JURYO + QUOTA_MAKUSHITA) {
            rank = 'Makushita';
            statsBase = 55 - (i - (QUOTA_MAKUUCHI + QUOTA_JURYO)) * 0.2;
            isSekitori = false;
        } else if (i < 500) {
            rank = 'Sandanme';
            statsBase = 40;
            isSekitori = false;
        } else if (i < 750) {
            rank = 'Jonidan';
            statsBase = 30;
            isSekitori = false;
        } else {
            rank = 'Jonokuchi';
            statsBase = 20;
            isSekitori = false;
        }

        const mind = Math.min(100, Math.max(1, Math.floor(statsBase + Math.random() * 10 - 5)));
        const technique = Math.min(100, Math.max(1, Math.floor(statsBase + Math.random() * 10 - 5)));
        const body = Math.min(100, Math.max(1, Math.floor(statsBase + Math.random() * 10 - 5)));

        wrestlers.push({
            id: `cpu-${i}`,
            heyaId: 'cpu_heya', // CPU Heya
            name: generateName(i),
            rank,
            stats: { mind, technique, body },
            isSekitori,
            injuryStatus: 'healthy',
            history: [],
            currentBashoStats: { wins: 0, losses: 0 }
        });
    }

    return wrestlers;
};
