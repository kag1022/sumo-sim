import { Wrestler, Matchup, Rank } from '../../../../types';
import { ATTRIBUTE_ADVANTAGE_BONUS } from '../../../../utils/constants';
import { MakuuchiStrategy } from './MakuuchiStrategy';
import { JuryoStrategy } from './JuryoStrategy';
import { MakushitaStrategy } from './MakushitaStrategy';

export class MatchMaker {
    private strategies: Record<string, any>;

    constructor() {
        this.strategies = {
            'Makuuchi': new MakuuchiStrategy(),
            'Juryo': new JuryoStrategy(),
            'Makushita': new MakushitaStrategy('Makushita'),
            'Sandanme': new MakushitaStrategy('Sandanme'),
            'Jonidan': new MakushitaStrategy('Jonidan'),
            'Jonokuchi': new MakushitaStrategy('Jonokuchi')
        };
    }

    public generateMatchups(wrestlers: Wrestler[], day: number): Matchup[] {
        // Filter eligible wrestlers
        const validWrestlers = wrestlers.filter(w =>
            w.rank !== 'MaeZumo' && w.injuryStatus !== 'injured'
        );

        // Group by Division
        const byDivision: Record<string, Wrestler[]> = {
            'Makuuchi': [],
            'Juryo': [],
            'Makushita': [],
            'Sandanme': [],
            'Jonidan': [],
            'Jonokuchi': []
        };

        validWrestlers.forEach(w => {
            const div = this.getDivision(w.rank);
            if (byDivision[div]) {
                byDivision[div].push(w);
            }
        });

        let allMatchups: Matchup[] = [];

        // Generate for each division
        for (const [div, list] of Object.entries(byDivision)) {
            const strategy = this.strategies[div];
            if (strategy) {
                const divisionMatchups = strategy.generate(list, day);
                allMatchups = [...allMatchups, ...divisionMatchups];
            }
        }

        return allMatchups;
    }

    // ... (previous code)

    public calculateWinChance(east: Wrestler, west: Wrestler): number {
        // 1. Dominant Attribute
        // Priority: Body > Technique > Mind
        const getAttribute = (w: Wrestler): 'Body' | 'Technique' | 'Mind' => {
            const { body, technique, mind } = w.stats;
            // "Most high value... If same, Body > Technique > Mind"
            if (body >= technique && body >= mind) return 'Body';
            if (technique >= mind) return 'Technique'; // Body was lower than one of them
            return 'Mind';
        };

        const attrA = getAttribute(east);
        const attrB = getAttribute(west);

        // 2. Base Force
        const getBaseForce = (w: Wrestler) => (w.stats.body + w.stats.technique + w.stats.mind) / 3;
        let forceA = getBaseForce(east);
        let forceB = getBaseForce(west);

        // 3. Attribute Advantage
        // Body > Tech > Mind > Body
        // Bonus: +15% (x1.15)

        let advantage: 'East' | 'West' | 'None' = 'None';
        if (attrA === 'Body' && attrB === 'Technique') advantage = 'East';
        else if (attrA === 'Technique' && attrB === 'Mind') advantage = 'East';
        else if (attrA === 'Mind' && attrB === 'Body') advantage = 'East';
        else if (attrB === 'Body' && attrA === 'Technique') advantage = 'West';
        else if (attrB === 'Technique' && attrA === 'Mind') advantage = 'West';
        else if (attrB === 'Mind' && attrA === 'Body') advantage = 'West';

        const multiplier = 1 + ATTRIBUTE_ADVANTAGE_BONUS;

        if (advantage === 'East') forceA *= multiplier;
        if (advantage === 'West') forceB *= multiplier;


        // 4. Probability
        const totalForce = forceA + forceB;
        // Handle edge case 0
        if (totalForce === 0) return 0.5;

        let prob = forceA / totalForce;

        // 5. Rank Bonus (Legacy / Preserved)
        // Ensure getRankValue is available (it is private method below)
        const valA = this.getRankValue(east.rank);
        const valB = this.getRankValue(west.rank);
        const diff = valA - valB;

        // 2% per 100 pts diff
        const rankBonus = (diff / 100) * 0.02;

        // Clamp Rank Bonus
        const clampedRankBonus = Math.max(-0.2, Math.min(0.2, rankBonus));
        prob += clampedRankBonus;

        // Yokozuna Special Bonus (Preserved)
        if (east.rank === 'Yokozuna' && !['Yokozuna', 'Ozeki'].includes(west.rank)) {
            prob += 0.15;
        }
        if (west.rank === 'Yokozuna' && !['Yokozuna', 'Ozeki'].includes(east.rank)) {
            prob -= 0.15;
        }

        // Reduce Variance / "Sigmoid" (Preserved logic idea)
        if (prob > 0.6) prob += 0.05;
        if (prob < 0.4) prob -= 0.05;

        // Final Clamp
        return Math.max(0.01, Math.min(0.99, prob));
    }

    private getRankValue(rank: Rank): number {
        // Simple internal map or import
        // If imported RANK_VALUE_MAP works, fine.
        const map: Record<string, number> = {
            'Yokozuna': 1000,
            'Ozeki': 500,
            'Sekiwake': 300,
            'Komusubi': 200,
            'Maegashira': 100,
            'Juryo': 50,
            'Makushita': 30,
            'Sandanme': 20,
            'Jonidan': 10,
            'Jonokuchi': 5,
            'MaeZumo': 0
        };
        return map[rank] || 0;
    }

    private getDivision(rank: Rank): string {

        if (['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi', 'Maegashira'].includes(rank)) return 'Makuuchi';
        return rank;
    }
}

export const matchMaker = new MatchMaker();
