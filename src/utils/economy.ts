import { Wrestler } from '../types';

export interface IncomeReport {
    grant: number;    // Association Grant
    tanimachi: number; // Tanimachi Support
    total: number;
}

/**
 * Calculates monthly income based on roster.
 */
export const calculateIncome = (wrestlers: Wrestler[]): IncomeReport => {
    // A. Association Grant
    // 70,000 JPY per wrestler
    const grant = wrestlers.length * 70000;

    // B. Tanimachi Support
    let tanimachi = 0;

    // Check for Sekitori
    const sekitoriList = wrestlers.filter(w => w.isSekitori);
    const sekitoriCount = sekitoriList.length;

    // Base Amount
    if (sekitoriCount === 0) {
        tanimachi += 150000; // No Sekitori Base
    } else {
        tanimachi += 1000000; // Sekitori Base
        tanimachi += sekitoriCount * 500000; // Bonus per Sekitori
    }

    // Rank Bonus (Sanyaku+)
    const hasSanyaku = wrestlers.some(w =>
        ['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi'].includes(w.rank)
    );

    if (hasSanyaku) {
        tanimachi += 2000000;
    }

    return {
        grant,
        tanimachi,
        total: grant + tanimachi
    };
};

/**
 * Calculates monthly expenses (maintenance).
 */
export const calculateExpenses = (wrestlers: Wrestler[]): number => {
    // Current Logic: Base 5000/day + Sekitori 5000/day.
    // Monthly = Daily * 30 days.
    const BASE_COST_DAILY = 5000;
    const SEKITORI_COST_DAILY = 5000;

    let totalDailyCost = 0;

    wrestlers.forEach(w => {
        let cost = BASE_COST_DAILY;
        if (w.isSekitori) cost += SEKITORI_COST_DAILY;
        totalDailyCost += cost;
    });

    return totalDailyCost * 30;
};
