import { EVENTS } from '../data/eventRegistry';
import { GameEvent } from '../types';
import { Wrestler } from '../../../types';
import { mitigateScandalImpact } from '../../heya/logic/okami';

export const checkForWeeklyEvent = (
    funds: number,
    reputation: number,
    currentDate: Date,
    wrestlers: Wrestler[],
    okamiLevel: number
): GameEvent | null => {

    // 0. Priority: Check for Wrestler Specific Events (Boycott, Scandal)
    // Filter to Player Heya ONLY to prevent CPU spam (600+ wrestlers triggering events)
    const playerWrestlers = wrestlers.filter(w => w.heyaId === 'player_heya');
    const shuffledWrestlers = [...playerWrestlers].sort(() => Math.random() - 0.5);

    for (const w of shuffledWrestlers) {
        // A. Boycott Check (Stress > 80)
        if ((w.stress || 0) > 80) {
            // 5% Chance if high stress (Reduced from 10%)
            if (Math.random() < 0.05) {
                return {
                    id: 'boycott',
                    title: 'event.boycott.title',
                    description: 'event.boycott.desc',
                    type: 'Bad',
                    targetWrestlerId: w.id,
                    params: { name: w.name },
                    effects: {
                        motivation: -5 // Will reduce Mind and Stress
                    }
                };
            }
        }

        // B. Scandal Check
        let scandalChance = 0.0001; // 0.01% (Reduced from 0.05%)
        if ((w.stress || 0) > 95) scandalChance += 0.002; // +0.2% risk (Reduced from 1%)

        if (Math.random() < scandalChance) {
            // Player Penalty
            const baseRepLoss = 20;
            const mitigatedLoss = mitigateScandalImpact(baseRepLoss, okamiLevel);
            const fine = 1000000;

            return {
                id: 'scandal',
                title: 'event.scandal.title',
                description: 'event.scandal.desc',
                type: 'Bad',
                targetWrestlerId: w.id,
                params: { name: w.name, fine: fine.toLocaleString(), repLoss: mitigatedLoss },
                effects: {
                    funds: -fine,
                    reputation: -mitigatedLoss
                }
            };
        }
    }


    // 1. Chance to trigger standard events (15%)
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
        if (event.id === 'inflation_chanko' && funds < 0) return true;

        // Specific Reputation Checks
        if (event.id === 'mayor_visit' && reputation < 60) return false;
        if (event.id === 'tanimachi_party' && reputation < 30) return false;

        if (event.id === 'tax_audit' && funds < 1000000) return false;

        return true;
    });

    if (validEvents.length === 0) return null;

    // 3. Random Selection
    const randomIndex = Math.floor(Math.random() * validEvents.length);
    return validEvents[randomIndex];
};
