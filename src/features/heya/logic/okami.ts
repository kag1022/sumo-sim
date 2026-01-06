import { Wrestler } from '../../../types';

interface OkamiLevelInfo {
    cost: number;
    stressRelief: number;
    budgetCut: number; // Percentage (0.1 = 10%)
    scandalMitigation: number; // Percentage of reputation loss reduced
}

export const OKAMI_LEVELS: Record<number, OkamiLevelInfo> = {
    1: { cost: 0, stressRelief: 2, budgetCut: 0, scandalMitigation: 0 },
    2: { cost: 3000000, stressRelief: 4, budgetCut: 0.1, scandalMitigation: 0.1 },
    3: { cost: 10000000, stressRelief: 6, budgetCut: 0.2, scandalMitigation: 0.25 },
    4: { cost: 30000000, stressRelief: 8, budgetCut: 0.3, scandalMitigation: 0.5 },
    5: { cost: 100000000, stressRelief: 10, budgetCut: 0.4, scandalMitigation: 0.8 },
};

export const MAX_OKAMI_LEVEL = 5;

/**
 * Applies daily stress relief to wrestlers based on Okami Level.
 * Returns the updated list of wrestlers.
 */
export const applyOkamiStressRelief = (wrestlers: Wrestler[], level: number): Wrestler[] => {
    const relief = OKAMI_LEVELS[level]?.stressRelief || 0;
    if (relief <= 0) return wrestlers;

    return wrestlers.map(w => ({
        ...w,
        stress: Math.max(0, (w.stress || 0) - relief) // Ensure no negative stress
    }));
};

/**
 * Returns the budget mulitplier (e.g. 0.9 for 10% cut)
 */
export const getOkamiBudgetMultiplier = (level: number): number => {
    const cut = OKAMI_LEVELS[level]?.budgetCut || 0;
    return Math.max(0, 1 - cut);
};

export const getOkamiUpgradeCost = (currentLevel: number): number | null => {
    if (currentLevel >= MAX_OKAMI_LEVEL) return null;
    return OKAMI_LEVELS[currentLevel + 1].cost;
};

export const mitigateScandalImpact = (reputationLoss: number, level: number): number => {
    const mitigation = OKAMI_LEVELS[level]?.scandalMitigation || 0;
    return Math.floor(reputationLoss * (1 - mitigation));
};
