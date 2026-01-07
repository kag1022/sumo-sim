
import { Wrestler } from '../../../../types';
import { IMatchmakingStrategy } from './types';
import { ATTRIBUTE_ADVANTAGE_BONUS } from '../../../../utils/constants';

// Since the logic is largely shared, we can implement a base class or utility.
// For now, I'll implement the standard logic here and others can extend or use it.

export class StandardWinStrategy implements IMatchmakingStrategy {
    calculateWinChance(east: Wrestler, west: Wrestler): number {
        // 1. Dominant Attribute
        const getAttribute = (w: Wrestler): 'Body' | 'Technique' | 'Mind' => {
            const { body, technique, mind } = w.stats;
            if (body >= technique && body >= mind) return 'Body';
            if (technique >= mind) return 'Technique';
            return 'Mind';
        };

        const attrA = getAttribute(east);
        const attrB = getAttribute(west);

        // 2. Base Force
        const getBaseForce = (w: Wrestler) => (w.stats.body + w.stats.technique + w.stats.mind) / 3;
        let forceA = getBaseForce(east);
        let forceB = getBaseForce(west);

        // 3. Attribute Advantage
        let advantage: 'East' | 'West' | 'None' = 'None';
        if (attrA === 'Body' && attrB === 'Technique') advantage = 'East';
        else if (attrA === 'Technique' && attrB === 'Mind') advantage = 'East';
        else if (attrA === 'Mind' && attrB === 'Body') advantage = 'East';
        else if (attrB === 'Body' && attrA === 'Technique') advantage = 'West';
        else if (attrB === 'Technique' && attrA === 'Mind') advantage = 'West';
        else if (attrB === 'Mind' && attrA === 'Body') advantage = 'West';

        const multiplier = 1 + (ATTRIBUTE_ADVANTAGE_BONUS || 0.15);

        if (advantage === 'East') forceA *= multiplier;
        if (advantage === 'West') forceB *= multiplier;

        // 3.5. Skill Bonuses
        const applySkillBonuses = (w: Wrestler, force: number, attr: string, opponent: Wrestler) => {
            const skills = w.skills || [];
            let result = force;
            if (skills.includes('IronHead')) result *= 1.05;
            if (skills.includes('GiantKiller') && opponent.weight - w.weight >= 20) result *= 1.15;
            if (skills.includes('EscapeArtist') && attr === 'Mind') result *= 1.20;
            if (skills.includes('Bulldozer') && attr === 'Body') result *= 1.10;
            return result;
        };

        forceA = applySkillBonuses(east, forceA, attrA, west);
        forceB = applySkillBonuses(west, forceB, attrB, east);

        // 4. Probability
        const totalForce = forceA + forceB;
        if (totalForce === 0) return 0.5;

        let prob = forceA / totalForce;

        // 5. Rank Bonus (Legacy)
        const getRankValue = (rank: string) => {
            const map: Record<string, number> = {
                'Yokozuna': 1000, 'Ozeki': 500, 'Sekiwake': 300, 'Komusubi': 200, 'Maegashira': 100,
                'Juryo': 50, 'Makushita': 30, 'Sandanme': 20, 'Jonidan': 10, 'Jonokuchi': 5, 'MaeZumo': 0
            };
            return map[rank] || 0;
        };
        const valA = getRankValue(east.rank);
        const valB = getRankValue(west.rank);
        const diff = valA - valB;
        const rankBonus = (diff / 100) * 0.02;
        const clampedRankBonus = Math.max(-0.2, Math.min(0.2, rankBonus));

        prob += clampedRankBonus;

        // Yokozuna Special Bonus
        if (east.rank === 'Yokozuna' && !['Yokozuna', 'Ozeki'].includes(west.rank)) prob += 0.15;
        if (west.rank === 'Yokozuna' && !['Yokozuna', 'Ozeki'].includes(east.rank)) prob -= 0.15;

        // Variance Reduction
        if (prob > 0.6) prob += 0.05;
        if (prob < 0.4) prob -= 0.05;

        return Math.max(0.01, Math.min(0.99, prob));
    }
}
