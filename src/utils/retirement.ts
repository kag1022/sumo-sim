import { Wrestler, Rank } from '../types';
import { RANK_VALUE_MAP } from './constants';

export const calculateSeverance = (wrestler: Wrestler): number => {
    // 1. Max Rank Bonus
    let rankBonus = 0;
    const rank = wrestler.maxRank;

    if (rank === 'Yokozuna') rankBonus = 100000000;
    else if (rank === 'Ozeki') rankBonus = 30000000;
    else if (['Sekiwake', 'Komusubi'].includes(rank)) rankBonus = 15000000;
    else if (['Maegashira'].includes(rank)) rankBonus = 10000000;
    else if (['Juryo'].includes(rank)) rankBonus = 3000000;
    else rankBonus = 0;

    // 2. Tenure Bonus
    // 100,000 JPY per Year. (timeInHeya is in months? Let's assume months for now or convert)
    // If timeInHeya is months:
    const years = Math.floor(wrestler.timeInHeya / 12);
    const tenureBonus = years * 100000;

    return rankBonus + tenureBonus;
};

// Helper to check if Max Rank needs update
// Using RANK_VALUE_MAP from constants
export const shouldUpdateMaxRank = (currentRank: Rank, maxRank: Rank): boolean => {
    const currentVal = RANK_VALUE_MAP[currentRank] || 0;
    const maxVal = RANK_VALUE_MAP[maxRank] || 0;
    return currentVal > maxVal;
};
