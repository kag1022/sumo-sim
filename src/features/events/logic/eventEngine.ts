import { EVENTS } from '../data/eventRegistry';
import { GameEvent } from '../types';

export const checkForWeeklyEvent = (
    funds: number,
    reputation: number,
    currentDate: Date
): GameEvent | null => {
    // 1. Chance to trigger (15%)
    if (Math.random() > 0.15) return null;

    // 2. Filter valid events
    const validEvents = EVENTS.filter(event => {
        // --- Condition Checks ---

        // Seasonal Checks
        const month = currentDate.getMonth() + 1; // 1-12
        if (event.id === 'cherry_blossom' && month !== 4) return false;
        if (event.id === 'summer_heat' && (month < 7 || month > 9)) return false;
        if (event.id === 'winter_training' && (month < 1 || month > 2)) return false;

        // Financial Checks
        if (event.id === 'inflation_chanko' && funds < 0) return true; // Can happen anytime but hurts more if poor? Or maybe irrelevant.
        // Actually, let's say "Tax Audit" only if you have money? Or "Bankruptcy" warnings?
        // Let's keep it simple.

        // Specific Reputation Checks
        if (event.id === 'mayor_visit' && reputation < 60) return false; // Needs some rep
        if (event.id === 'tanimachi_party' && reputation < 30) return false;

        // Bad events specific logic?
        if (event.id === 'tax_audit' && funds < 1000000) return false; // Don't audit if poor

        return true;
    });

    if (validEvents.length === 0) return null;

    // 3. Random Selection
    const randomIndex = Math.floor(Math.random() * validEvents.length);
    return validEvents[randomIndex];
};
